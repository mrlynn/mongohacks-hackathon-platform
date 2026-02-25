import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { PrizeModel } from "@/lib/db/models/Prize";
import { PartnerModel } from "@/lib/db/models/Partner";
import { createPrizeSchema } from "@/lib/db/schemas";
import { auth } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/utils";
import { isValidObjectId } from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const partnerId = searchParams.get("partnerId");
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");

    const filter: Record<string, unknown> = {};
    
    if (eventId) {
      if (!isValidObjectId(eventId)) {
        return errorResponse("Invalid event ID", 400);
      }
      filter.eventId = eventId;
    }
    
    if (partnerId) {
      if (!isValidObjectId(partnerId)) {
        return errorResponse("Invalid partner ID", 400);
      }
      filter.partnerId = partnerId;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (isActive !== null) {
      filter.isActive = isActive === "true";
    }

    const prizes = await PrizeModel.find(filter)
      .populate("partnerId", "name logo tier")
      .populate("eventId", "name")
      .sort({ displayOrder: 1, monetaryValue: -1 })
      .lean();

    return successResponse({ prizes });
  } catch (error) {
    console.error("GET /api/prizes error:", error);
    return errorResponse("Failed to fetch prizes", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    if ((session.user as any).role !== "admin") {
      return errorResponse("Forbidden - Admin access required", 403);
    }

    const body = await request.json();
    const validationResult = createPrizeSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse("Validation failed", 400);
    }

    await connectToDatabase();

    const { partnerId, eventId, ...prizeData } = validationResult.data;

    // Verify event exists
    if (!isValidObjectId(eventId)) {
      return errorResponse("Invalid event ID", 400);
    }

    // Verify partner exists (if provided)
    if (partnerId && !isValidObjectId(partnerId)) {
      return errorResponse("Invalid partner ID", 400);
    }

    const prize = await PrizeModel.create({
      ...prizeData,
      eventId,
      partnerId: partnerId || undefined,
      winners: [],
    });

    // Update partner's engagement if partner is linked
    if (partnerId) {
      await PartnerModel.findByIdAndUpdate(partnerId, {
        $addToSet: {
          "engagement.prizesOffered": prize._id,
          "engagement.eventsParticipated": eventId,
        },
        $set: {
          "engagement.lastEngagementDate": new Date(),
        },
      });
    }

    return successResponse(
      {
        message: "Prize created successfully",
        prize,
      },
      201
    );
  } catch (error) {
    console.error("POST /api/prizes error:", error);
    return errorResponse("Failed to create prize", 500);
  }
}
