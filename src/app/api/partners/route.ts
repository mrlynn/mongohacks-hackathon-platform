import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { PartnerModel } from "@/lib/db/models/Partner";
import { createPartnerSchema } from "@/lib/db/schemas";
import { auth } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const tier = searchParams.get("tier");
    const industry = searchParams.get("industry");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (status) {
      filter.status = status;
    }
    if (tier) {
      filter.tier = tier;
    }
    if (industry) {
      filter.industry = industry;
    }

    const [partners, total] = await Promise.all([
      PartnerModel.find(filter)
        .sort({ tier: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PartnerModel.countDocuments(filter),
    ]);

    return successResponse({
      partners,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/partners error:", error);
    return errorResponse("Failed to fetch partners", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    // Check if user is admin
    if ((session.user as any).role !== "admin") {
      return errorResponse("Forbidden - Admin access required", 403);
    }

    const body = await request.json();
    const validationResult = createPartnerSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse("Validation failed", 400);
    }

    await connectToDatabase();

    const partner = await PartnerModel.create({
      ...validationResult.data,
      engagement: {
        eventsParticipated: [],
        prizesOffered: [],
      },
    });

    return successResponse(
      {
        message: "Partner created successfully",
        partner,
      },
      201
    );
  } catch (error) {
    console.error("POST /api/partners error:", error);
    return errorResponse("Failed to create partner", 500);
  }
}
