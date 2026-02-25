import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country");
    const status = searchParams.get("status") || "open";

    const query: Record<string, unknown> = {
      coordinates: { $exists: true },
      status: status === "all" ? { $exists: true } : status,
    };

    if (country) {
      query.country = country;
    }

    const events = await EventModel.find(query)
      .select("name city country coordinates venue startDate endDate isVirtual status")
      .sort({ startDate: 1 })
      .limit(500);

    return NextResponse.json({
      success: true,
      count: events.length,
      events: events.map((event) => ({
        _id: event._id.toString(),
        name: event.name,
        city: event.city,
        country: event.country,
        coordinates: event.coordinates?.coordinates || [0, 0],
        venue: event.venue,
        startDate: event.startDate?.toISOString() || new Date().toISOString(),
        endDate: event.endDate?.toISOString() || new Date().toISOString(),
        isVirtual: event.isVirtual,
        status: event.status,
      })),
    });
  } catch (error) {
    console.error("Error fetching map events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
