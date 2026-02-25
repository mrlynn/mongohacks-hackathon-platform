import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { PartnerModel } from "@/lib/db/models/Partner";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    await connectToDatabase();

    const body = await request.json();

    // Create event with organizer as current user
    const event = new EventModel({
      ...body,
      organizers: [(session.user as any).id],
    });

    await event.save();

    // Sync partners: add this event to each partner's eventsParticipated
    if (body.partners && body.partners.length > 0) {
      await PartnerModel.updateMany(
        { _id: { $in: body.partners } },
        {
          $addToSet: { "engagement.eventsParticipated": event._id },
          $set: { "engagement.lastEngagementDate": new Date() },
        }
      );
    }

    return NextResponse.json({
      success: true,
      event: {
        ...event.toObject(),
        _id: event._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const country = searchParams.get("country");

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (country) query.country = country;

    const events = await EventModel.find(query)
      .populate("organizers", "name email")
      .populate("partners", "name tier logo")
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({
      success: true,
      events: events.map((event) => ({
        ...event.toObject(),
        _id: event._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
