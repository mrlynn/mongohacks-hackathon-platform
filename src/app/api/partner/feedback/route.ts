import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getEffectivePartnerIdForApi } from "@/lib/partner-context-api";
import { connectToDatabase } from "@/lib/db/connection";
import { PartnerModel } from "@/lib/db/models/Partner";
import { EventModel } from "@/lib/db/models/Event";
import { FeedbackResponseModel } from "@/lib/db/models/FeedbackResponse";
import { partnerLogger } from "@/lib/logger";

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user as { id?: string };
    const partnerId = await getEffectivePartnerIdForApi();
    if (!partnerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const partner = await PartnerModel.findById(partnerId)
      .select("engagement.eventsParticipated")
      .lean();

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const eventIds = partner.engagement?.eventsParticipated || [];

    // Get events with partner feedback forms
    const events = await EventModel.find({
      _id: { $in: eventIds },
      "feedbackForms.partner": { $exists: true, $ne: null },
    })
      .select("name status feedbackForms.partner startDate")
      .populate("feedbackForms.partner", "title description")
      .sort({ startDate: -1 })
      .lean();

    // Check which events this user has already submitted feedback for
    const userId = user.id;
    const submissions = await FeedbackResponseModel.find({
      userId,
      eventId: { $in: eventIds },
    })
      .select("eventId formConfigId")
      .lean();

    const submittedEventIds = new Set(submissions.map((s) => s.eventId.toString()));

    const feedbackEvents = events.map((e) => ({
      _id: e._id.toString(),
      name: e.name,
      status: e.status,
      startDate: e.startDate?.toISOString() || "",
      feedbackForm: e.feedbackForms?.partner
        ? {
            _id: (e.feedbackForms.partner as { _id: { toString: () => string } })._id.toString(),
            title: (e.feedbackForms.partner as { title: string }).title,
            description: (e.feedbackForms.partner as { description?: string }).description || "",
          }
        : null,
      hasSubmitted: submittedEventIds.has(e._id.toString()),
    }));

    return NextResponse.json({ feedbackEvents });
  } catch (error) {
    partnerLogger.error({ err: error }, "Partner feedback GET error")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
