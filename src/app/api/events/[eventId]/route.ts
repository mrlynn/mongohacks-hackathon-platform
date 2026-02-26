import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { successResponse, errorResponse } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await connectToDatabase();
    const { eventId } = await params;

    const event = await EventModel.findById(eventId).lean();

    if (!event) {
      return errorResponse("Event not found", 404);
    }

    // Count registered participants
    const registeredCount = await ParticipantModel.countDocuments({
      "registeredEvents.eventId": eventId,
    });

    // Calculate spots remaining
    const spotsRemaining = Math.max(0, event.capacity - registeredCount);

    return successResponse({
      event,
      stats: {
        registered: registeredCount,
        capacity: event.capacity,
        spotsRemaining,
        percentFull: event.capacity > 0 ? Math.round((registeredCount / event.capacity) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("GET /api/events/[eventId] error:", error);
    return errorResponse("Failed to fetch event", 500);
  }
}
