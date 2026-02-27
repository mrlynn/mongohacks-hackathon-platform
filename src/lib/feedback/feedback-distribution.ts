import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { PartnerModel } from "@/lib/db/models/Partner";
import { UserModel } from "@/lib/db/models/User";
import { sendEmail } from "@/lib/email/email-service";
import { feedbackRequestEmail } from "@/lib/email/templates";
import { notifyFeedbackRequested } from "@/lib/notifications/notification-service";

export async function sendFeedbackRequests(
  eventId: string,
  audience: "participant" | "partner" | "both" = "both"
): Promise<{ participantsSent: number; partnersSent: number }> {
  await connectToDatabase();

  const event = await EventModel.findById(eventId)
    .select("name feedbackForms partners")
    .lean();

  if (!event) {
    throw new Error("Event not found");
  }

  const feedbackForms = event.feedbackForms as
    | { participant?: { toString(): string }; partner?: { toString(): string } }
    | undefined;

  let participantsSent = 0;
  let partnersSent = 0;

  // Send to participants
  if (
    (audience === "participant" || audience === "both") &&
    feedbackForms?.participant
  ) {
    const formId = feedbackForms.participant.toString();
    const formUrl = `/feedback/${formId}?eventId=${eventId}`;

    const participants = await ParticipantModel.find({
      "registeredEvents.eventId": eventId,
    })
      .select("userId")
      .lean();

    const userIds = participants.map((p) =>
      (p.userId as { toString(): string }).toString()
    );

    if (userIds.length > 0) {
      const users = await UserModel.find({ _id: { $in: userIds } })
        .select("name email")
        .lean();

      for (const user of users) {
        const userId = (user._id as { toString(): string }).toString();
        notifyFeedbackRequested(
          userId,
          user.name,
          user.email,
          event.name,
          eventId,
          formUrl
        );
        participantsSent++;
      }
    }
  }

  // Send to partners
  if (
    (audience === "partner" || audience === "both") &&
    feedbackForms?.partner
  ) {
    const formId = feedbackForms.partner.toString();
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const formUrl = `${baseUrl}/feedback/${formId}?eventId=${eventId}`;

    const partnerIds = (event.partners || []).map((id: unknown) =>
      String(id)
    );

    if (partnerIds.length > 0) {
      const partners = await PartnerModel.find({
        _id: { $in: partnerIds },
        status: "active",
      })
        .select("contacts name")
        .lean();

      for (const partner of partners) {
        const contacts = (
          partner.contacts as Array<{
            name: string;
            email: string;
            isPrimary?: boolean;
          }>
        ) || [];

        // Send to primary contact, or first contact if no primary
        const contact =
          contacts.find((c) => c.isPrimary) || contacts[0];

        if (contact?.email) {
          const template = feedbackRequestEmail(
            contact.name,
            event.name,
            formUrl
          );
          sendEmail({
            to: contact.email,
            subject: template.subject,
            html: template.html,
            text: template.text,
          }).catch((err) =>
            console.error(
              `Failed to send feedback email to partner ${partner.name}:`,
              err
            )
          );
          partnersSent++;
        }
      }
    }
  }

  return { participantsSent, partnersSent };
}
