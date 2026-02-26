import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { PrizeModel } from "@/lib/db/models/Prize";
import { PartnerModel } from "@/lib/db/models/Partner";
import { updatePrizeSchema } from "@/lib/db/schemas";
import { isUserAdmin } from "@/lib/admin-guard";
import { errorResponse, successResponse } from "@/lib/utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ prizeId: string }> }
) {
  try {
    if (!(await isUserAdmin())) {
      return errorResponse("Forbidden", 403);
    }

    const { prizeId } = await params;
    const body = await request.json();
    const validation = updatePrizeSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues.map((e) => e.message).join(", "),
        400
      );
    }

    await connectToDatabase();

    const prize = await PrizeModel.findByIdAndUpdate(
      prizeId,
      { $set: validation.data },
      { new: true }
    ).populate("partnerId", "name logo tier");

    if (!prize) {
      return errorResponse("Prize not found", 404);
    }

    return successResponse({ prize });
  } catch (error) {
    console.error("PATCH /api/prizes/[prizeId] error:", error);
    return errorResponse("Failed to update prize", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ prizeId: string }> }
) {
  try {
    if (!(await isUserAdmin())) {
      return errorResponse("Forbidden", 403);
    }

    const { prizeId } = await params;
    await connectToDatabase();

    const prize = await PrizeModel.findByIdAndDelete(prizeId);
    if (!prize) {
      return errorResponse("Prize not found", 404);
    }

    // Remove from partner engagement tracking
    if (prize.partnerId) {
      await PartnerModel.findByIdAndUpdate(prize.partnerId, {
        $pull: { "engagement.prizesOffered": prize._id },
      });
    }

    return successResponse({ message: "Prize deleted" });
  } catch (error) {
    console.error("DELETE /api/prizes/[prizeId] error:", error);
    return errorResponse("Failed to delete prize", 500);
  }
}
