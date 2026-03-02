import { NextRequest, NextResponse } from "next/server";
import { getEffectivePartnerIdForApi } from "@/lib/partner-context-api";
import { connectToDatabase } from "@/lib/db/connection";
import { PartnerModel } from "@/lib/db/models/Partner";
import { partnerLogger } from "@/lib/logger";

export async function GET() {
  try {
    const partnerId = await getEffectivePartnerIdForApi();
    if (!partnerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const partner = await PartnerModel.findById(partnerId)
      .select("name description logo website industry tier status companyInfo contacts social tags")
      .lean();

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    return NextResponse.json({ partner });
  } catch (error) {
    partnerLogger.error({ err: error }, "Partner profile GET error")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const partnerId = await getEffectivePartnerIdForApi();
    if (!partnerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    // Only allow partners to edit certain fields (not name, tier, status)
    const allowedFields = ["description", "logo", "website", "companyInfo", "social", "contacts", "tags"];
    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    await connectToDatabase();

    const partner = await PartnerModel.findByIdAndUpdate(
      partnerId,
      { $set: updates },
      { new: true }
    ).select("name description logo website industry tier status companyInfo contacts social tags");

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    return NextResponse.json({ partner });
  } catch (error) {
    partnerLogger.error({ err: error }, "Partner profile PATCH error")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
