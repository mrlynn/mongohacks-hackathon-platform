import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { PartnerModel } from "@/lib/db/models/Partner";
import { updatePartnerSchema } from "@/lib/db/schemas";
import { auth } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/utils";
import { isValidObjectId } from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return errorResponse("Invalid partner ID", 400);
    }

    await connectToDatabase();
    const partner = await PartnerModel.findById(id)
      .populate("engagement.eventsParticipated", "name startDate")
      .populate("engagement.prizesOffered", "title value")
      .lean();

    if (!partner) {
      return errorResponse("Partner not found", 404);
    }

    return successResponse({ partner });
  } catch (error) {
    console.error("GET /api/partners/[id] error:", error);
    return errorResponse("Failed to fetch partner", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    if ((session.user as any).role !== "admin") {
      return errorResponse("Forbidden - Admin access required", 403);
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return errorResponse("Invalid partner ID", 400);
    }

    const body = await request.json();
    const validationResult = updatePartnerSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse("Validation failed", 400);
    }

    await connectToDatabase();

    const partner = await PartnerModel.findByIdAndUpdate(
      id,
      { $set: validationResult.data },
      { new: true, runValidators: true }
    ).lean();

    if (!partner) {
      return errorResponse("Partner not found", 404);
    }

    return successResponse({
      message: "Partner updated successfully",
      partner,
    });
  } catch (error) {
    console.error("PATCH /api/partners/[id] error:", error);
    return errorResponse("Failed to update partner", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    if ((session.user as any).role !== "admin") {
      return errorResponse("Forbidden - Admin access required", 403);
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return errorResponse("Invalid partner ID", 400);
    }

    await connectToDatabase();

    const partner = await PartnerModel.findByIdAndDelete(id);

    if (!partner) {
      return errorResponse("Partner not found", 404);
    }

    return successResponse({
      message: "Partner deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/partners/[id] error:", error);
    return errorResponse("Failed to delete partner", 500);
  }
}
