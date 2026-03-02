import { NextRequest, NextResponse } from "next/server";
import { getEffectivePartnerIdForApi } from "@/lib/partner-context-api";
import { connectToDatabase } from "@/lib/db/connection";
import { PrizeModel } from "@/lib/db/models/Prize";
import { partnerLogger } from "@/lib/logger";

interface Props {
  params: Promise<{ prizeId: string }>;
}

export async function GET(_request: NextRequest, { params }: Props) {
  try {
    const { prizeId } = await params;
    const partnerId = await getEffectivePartnerIdForApi();
    if (!partnerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const prize = await PrizeModel.findOne({ _id: prizeId, partnerId })
      .populate("eventId", "name status")
      .lean();

    if (!prize) {
      return NextResponse.json({ error: "Prize not found" }, { status: 404 });
    }

    return NextResponse.json({ prize });
  } catch (error) {
    partnerLogger.error({ err: error }, "Partner prize GET error")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const { prizeId } = await params;
    const partnerId = await getEffectivePartnerIdForApi();
    if (!partnerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const allowedFields = ["title", "description", "value", "monetaryValue", "eligibility", "criteria", "isActive"];
    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) updates[key] = body[key];
    }

    await connectToDatabase();

    const prize = await PrizeModel.findOneAndUpdate(
      { _id: prizeId, partnerId },
      { $set: updates },
      { new: true }
    );

    if (!prize) {
      return NextResponse.json({ error: "Prize not found" }, { status: 404 });
    }

    return NextResponse.json({ prize });
  } catch (error) {
    partnerLogger.error({ err: error }, "Partner prize PATCH error")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  try {
    const { prizeId } = await params;
    const partnerId = await getEffectivePartnerIdForApi();
    if (!partnerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const prize = await PrizeModel.findOneAndDelete({ _id: prizeId, partnerId });

    if (!prize) {
      return NextResponse.json({ error: "Prize not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    partnerLogger.error({ err: error }, "Partner prize DELETE error")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
