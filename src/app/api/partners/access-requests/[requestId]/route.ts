import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { PartnerAccessRequestModel } from "@/lib/db/models/PartnerAccessRequest";
import { PartnerModel } from "@/lib/db/models/Partner";
import { UserModel } from "@/lib/db/models/User";
import { EventModel } from "@/lib/db/models/Event";
import { sendEmail } from "@/lib/email/email-service";
import { renderEmailTemplate } from "@/lib/email/template-renderer";

interface Props {
  params: Promise<{ requestId: string }>;
}

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const { requestId } = await params;
    const session = await auth();
    const user = session?.user as { role?: string; id?: string };
    if (!user?.role || (user.role !== "admin" && user.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { status, reviewNotes, assignToPartnerId } = body;

    if (!status || !["approved", "denied"].includes(status)) {
      return NextResponse.json(
        { error: "status must be 'approved' or 'denied'" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const accessRequest = await PartnerAccessRequestModel.findById(requestId)
      .populate("userId", "name email")
      .lean();

    if (!accessRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (accessRequest.status !== "pending") {
      return NextResponse.json(
        { error: "This request has already been reviewed" },
        { status: 400 }
      );
    }

    const requestUser = accessRequest.userId as unknown as { _id: { toString: () => string }; name: string; email: string };
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    if (status === "approved") {
      let partnerId = assignToPartnerId || accessRequest.partnerId;

      // Create new partner org if needed
      if (!partnerId && accessRequest.newPartnerDetails) {
        const newPartner = await PartnerModel.create({
          name: accessRequest.newPartnerDetails.companyName,
          description: accessRequest.newPartnerDetails.description,
          website: accessRequest.newPartnerDetails.website,
          industry: accessRequest.newPartnerDetails.industry,
          tier: accessRequest.newPartnerDetails.tier || "bronze",
          status: "active",
          contacts: [
            {
              name: requestUser.name,
              email: requestUser.email,
              role: "Representative",
              isPrimary: true,
            },
          ],
        });
        partnerId = newPartner._id;
      }

      // Update user to partner role
      await UserModel.findByIdAndUpdate(requestUser._id, {
        role: "partner",
        partnerId,
      });

      // Link events
      if (accessRequest.requestedEventIds?.length) {
        await PartnerModel.findByIdAndUpdate(partnerId, {
          $addToSet: {
            "engagement.eventsParticipated": { $each: accessRequest.requestedEventIds },
          },
        });

        // Also add partner to events
        await EventModel.updateMany(
          { _id: { $in: accessRequest.requestedEventIds } },
          { $addToSet: { partners: partnerId } }
        );
      }

      // Send approval email
      const template = await renderEmailTemplate("partner_access_approved", {
        userName: requestUser.name,
        companyName: accessRequest.newPartnerDetails?.companyName || "your organization",
        portalUrl: `${baseUrl}/partner`,
      });
      sendEmail({
        to: requestUser.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      }).catch(() => {});
    } else {
      // Send denial email
      const template = await renderEmailTemplate("partner_access_denied", {
        userName: requestUser.name,
        notes: reviewNotes || "",
      });
      sendEmail({
        to: requestUser.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      }).catch(() => {});
    }

    // Update request
    await PartnerAccessRequestModel.findByIdAndUpdate(requestId, {
      status,
      reviewedBy: user.id,
      reviewedAt: new Date(),
      reviewNotes: reviewNotes || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Access request PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
