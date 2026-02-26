import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { createEventSchema } from "@/lib/db/schemas";
import { auth } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (status) {
      filter.status = status;
    }

    const [events, total] = await Promise.all([
      EventModel.find(filter)
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EventModel.countDocuments(filter),
    ]);

    // Check if the current user is registered for any of these events
    let registeredEventIds: Set<string> = new Set();
    try {
      const session = await auth();
      if (session?.user) {
        const userId = (session.user as { id: string }).id;
        const participant = await ParticipantModel.findOne(
          { userId },
          { "registeredEvents.eventId": 1 }
        ).lean();
        if (participant?.registeredEvents) {
          registeredEventIds = new Set(
            participant.registeredEvents.map((re: any) =>
              re.eventId.toString()
            )
          );
        }
      }
    } catch {
      // If auth fails, just return events without registration status
    }

    const eventsWithStatus = events.map((event) => ({
      ...event,
      isRegistered: registeredEventIds.has(event._id.toString()),
    }));

    return successResponse({
      events: eventsWithStatus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/events error:", error);
    return errorResponse("Failed to fetch events", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    const userRole = (session.user as { role?: string }).role;
    const isImpersonating = (session.user as { isImpersonating?: boolean }).isImpersonating;
    if (!isImpersonating && userRole !== "admin" && userRole !== "organizer") {
      return errorResponse("Forbidden: insufficient permissions", 403);
    }

    const body = await request.json();
    const parsed = createEventSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 422);
    }

    await connectToDatabase();

    const event = await EventModel.create({
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      registrationDeadline: new Date(parsed.data.registrationDeadline),
      organizers: [(session.user as { id: string }).id],
      status: "draft",
    });

    return successResponse(event, 201);
  } catch (error) {
    console.error("POST /api/events error:", error);
    return errorResponse("Failed to create event", 500);
  }
}
