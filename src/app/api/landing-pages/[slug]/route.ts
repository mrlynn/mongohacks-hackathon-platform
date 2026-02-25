import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
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
    }).lean();

    if (!event) {
      return errorResponse("Landing page not found", 404);
    }

    return successResponse(event);
  } catch (error) {
    console.error("GET /api/landing-pages/[slug] error:", error);
    return errorResponse("Failed to fetch landing page", 500);
  }
}
