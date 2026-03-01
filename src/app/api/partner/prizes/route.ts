import { NextRequest, NextResponse } from "next/server";
import { getEffectivePartnerIdForApi } from "@/lib/partner-context-api";
import { connectToDatabase } from "@/lib/db/connection";
import { PrizeModel } from "@/lib/db/models/Prize";
import { PartnerModel } from "@/lib/db/models/Partner";
import { EventModel } from "@/lib/db/models/Event";

export async function GET() {
  try {
    const partnerId = await getEffectivePartnerIdForApi();
    if (!partnerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const [prizes, partner] = await Promise.all([
      PrizeModel.find({ partnerId })
        .populate("eventId", "name status")
        .sort({ createdAt: -1 })
        .lean(),
      PartnerModel.findById(partnerId)
        .select("engagement.eventsParticipated")
        .lean(),
    ]);

    // Fetch partner's events for the dropdown
    const eventIds = partner?.engagement?.eventsParticipated || [];
    const events = await EventModel.find({ _id: { $in: eventIds } })
      .select("name status")
      .sort({ startDate: -1 })
      .lean();

    const partnerEvents = events.map((e) => ({
      _id: e._id.toString(),
      name: e.name,
      status: e.status,
    }));

    return NextResponse.json({ prizes, events: partnerEvents });
  } catch (error) {
    console.error("Partner prizes GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const partnerId = await getEffectivePartnerIdForApi();
    if (!partnerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { eventId, title, description, value, monetaryValue, eligibility, criteria } = body;

    if (!eventId || !title || !description) {
      return NextResponse.json(
        { error: "eventId, title, and description are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify partner has access to this event
    const partner = await PartnerModel.findById(partnerId)
      .select("engagement.eventsParticipated")
      .lean();

    const hasAccess = partner?.engagement?.eventsParticipated?.some(
      (eid: { toString: () => string }) => eid.toString() === eventId
    );
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this event" },
        { status: 403 }
      );
    }

    const prize = await PrizeModel.create({
      eventId,
      partnerId,
      title,
      description,
      category: "sponsor",
      value,
      monetaryValue,
      eligibility,
      criteria,
      isActive: true,
    });

    // Track in partner engagement
    await PartnerModel.findByIdAndUpdate(partnerId, {
      $addToSet: { "engagement.prizesOffered": prize._id },
    });

    return NextResponse.json({ prize }, { status: 201 });
  } catch (error) {
    console.error("Partner prizes POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
