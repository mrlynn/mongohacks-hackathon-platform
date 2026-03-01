import { NextResponse } from "next/server";
import { getEffectivePartnerIdForApi } from "@/lib/partner-context-api";
import { connectToDatabase } from "@/lib/db/connection";
import { PartnerModel } from "@/lib/db/models/Partner";
import { EventModel } from "@/lib/db/models/Event";
import { PrizeModel } from "@/lib/db/models/Prize";
import { ProjectModel } from "@/lib/db/models/Project";

export async function GET() {
  try {
    const partnerId = await getEffectivePartnerIdForApi();
    if (!partnerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const partner = await PartnerModel.findById(partnerId)
      .select("engagement tier")
      .lean();

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const eventIds = partner.engagement?.eventsParticipated || [];

    // Get events with stats
    const events = await EventModel.find({ _id: { $in: eventIds } })
      .select("name status startDate capacity")
      .sort({ startDate: -1 })
      .lean();

    // Get all prizes for this partner
    const prizes = await PrizeModel.find({ partnerId }).lean();

    // Prize stats
    const totalPrizeValue = prizes.reduce((sum, p) => sum + (p.monetaryValue || 0), 0);
    const activePrizes = prizes.filter((p) => p.isActive).length;
    const totalWinners = prizes.reduce((sum, p) => sum + (p.winners?.length || 0), 0);

    // Prize distribution by category
    const categoryDistribution: Record<string, number> = {};
    for (const p of prizes) {
      categoryDistribution[p.category] = (categoryDistribution[p.category] || 0) + 1;
    }

    // Per-event stats
    const eventStats = await Promise.all(
      events.map(async (event) => {
        const projectCount = await ProjectModel.countDocuments({ eventId: event._id });
        const eventPrizes = prizes.filter((p) => p.eventId.toString() === event._id.toString());
        const eventPrizeValue = eventPrizes.reduce((sum, p) => sum + (p.monetaryValue || 0), 0);

        return {
          _id: event._id.toString(),
          name: event.name,
          status: event.status,
          startDate: event.startDate?.toISOString() || "",
          capacity: event.capacity || 0,
          projectCount,
          prizeCount: eventPrizes.length,
          prizeValue: eventPrizeValue,
        };
      })
    );

    return NextResponse.json({
      summary: {
        totalEvents: events.length,
        activeEvents: events.filter((e) => e.status === "open" || e.status === "in_progress").length,
        totalPrizes: prizes.length,
        activePrizes,
        totalPrizeValue,
        totalWinners,
        tier: partner.tier,
      },
      categoryDistribution,
      eventStats,
    });
  } catch (error) {
    console.error("Partner analytics GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
