import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { notifyResultsPublished } from "@/lib/notifications/notification-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userRole = (session.user as { role?: string }).role;
    if (!["admin", "organizer"].includes(userRole || "")) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { eventId } = await params;

    const body = await request.json();
    const { publish } = body;

    if (typeof publish !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Invalid publish value" },
        { status: 400 }
      );
    }

    const event = await EventModel.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    event.resultsPublished = publish;
    if (publish) {
      event.resultsPublishedAt = new Date();
    }
    await event.save();

    // Fire-and-forget: notify participants when results are published
    if (publish) {
      ParticipantModel.find({ "registeredEvents.eventId": eventId })
        .select("userId")
        .lean()
        .then((participants: any[]) => {
          const userIds = participants.map((p) => p.userId.toString());
          notifyResultsPublished(userIds, event.name, eventId);
        })
        .catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: publish
        ? "Results published successfully"
        : "Results unpublished successfully",
      event: {
        _id: event._id.toString(),
        resultsPublished: event.resultsPublished,
        resultsPublishedAt: event.resultsPublishedAt,
      },
    });
  } catch (error) {
    console.error("POST /api/admin/events/[eventId]/publish-results error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update results publication status" },
      { status: 500 }
    );
  }
}
