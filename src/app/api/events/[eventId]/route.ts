import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { successResponse, errorResponse } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { isValidObjectId } from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await connectToDatabase();
    const { eventId } = await params;
    const session = await auth();

    // Validate eventId is a valid MongoDB ObjectId
    if (!isValidObjectId(eventId)) {
      return errorResponse("Invalid event ID format", 400);
    }

    const event = await EventModel.findById(eventId).lean();

    if (!event) {
      return errorResponse("Event not found", 404);
    }

    // Count registered participants
    const registeredCount = await ParticipantModel.countDocuments({
      "registeredEvents.eventId": eventId,
    });

    // Check if the current user is already registered
    let isRegistered = false;
    if (session?.user) {
      const userId = (session.user as any).id;
      const participant = await ParticipantModel.findOne({
        userId,
        "registeredEvents.eventId": eventId,
      }).lean();
      isRegistered = !!participant;
    }

    // Calculate spots remaining
    const spotsRemaining = Math.max(0, event.capacity - registeredCount);

    return successResponse({
      event,
      isRegistered,
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
