import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { PrizeModel } from "@/lib/db/models/Prize";
import { errorResponse, successResponse } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectToDatabase();

    const event = await EventModel.findOne({
      "landingPage.slug": slug,
      "landingPage.published": true,
    })
      .populate("partners", "name description logo website tier industry")
      .lean();

    if (!event) {
      return errorResponse("Landing page not found", 404);
    }

    // Fetch partner-sponsored prizes
    const partnerPrizes = await PrizeModel.find({
      eventId: event._id,
      partnerId: { $exists: true, $ne: null },
      isActive: true,
    })
      .populate("partnerId", "name logo")
      .sort({ displayOrder: 1 })
      .lean();

    const result = {
      ...event,
      partnerPrizes: partnerPrizes.map((p: any) => ({
        title: p.title,
        description: p.description,
        value: p.value,
        category: p.category,
        partnerName: p.partnerId?.name || "Partner",
        partnerLogo: p.partnerId?.logo,
      })),
    };

    return successResponse(result);
  } catch (error) {
    console.error("GET /api/landing-pages/[slug] error:", error);
    return errorResponse("Failed to fetch landing page", 500);
  }
}
