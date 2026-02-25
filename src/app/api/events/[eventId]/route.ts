import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { updateEventSchema } from "@/lib/db/schemas";
import { auth } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    await connectToDatabase();

    const event = await EventModel.findById(eventId).lean();
    if (!event) {
      return errorResponse("Event not found", 404);
    }

    // Serialize dates properly
    const serializedEvent = {
      ...event,
      _id: event._id.toString(),
      startDate: event.startDate?.toISOString() || new Date().toISOString(),
      endDate: event.endDate?.toISOString() || new Date().toISOString(),
      registrationDeadline: event.registrationDeadline?.toISOString() || new Date().toISOString(),
      createdAt: event.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: event.updatedAt?.toISOString() || new Date().toISOString(),
    };

    return successResponse({ event: serializedEvent });
  } catch (error) {
    console.error("GET /api/events/[eventId] error:", error);
    return errorResponse("Failed to fetch event", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    const { eventId } = await params;
    const body = await request.json();
    const parsed = updateEventSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 422);
    }

    await connectToDatabase();

    const event = await EventModel.findByIdAndUpdate(
      eventId,
      { $set: parsed.data },
      { new: true, runValidators: true }
    ).lean();

    if (!event) {
      return errorResponse("Event not found", 404);
    }

    return successResponse(event);
  } catch (error) {
    console.error("PATCH /api/events/[eventId] error:", error);
    return errorResponse("Failed to update event", 500);
  }
}
