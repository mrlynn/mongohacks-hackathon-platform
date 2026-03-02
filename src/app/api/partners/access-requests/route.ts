import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { PartnerAccessRequestModel } from "@/lib/db/models/PartnerAccessRequest";
import { partnerLogger } from "@/lib/logger";

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!role || (role !== "admin" && role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const requests = await PartnerAccessRequestModel.find()
      .populate("userId", "name email")
      .populate("partnerId", "name")
      .populate("requestedEventIds", "name")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ requests });
  } catch (error) {
    partnerLogger.error({ err: error }, "Access requests GET error")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
