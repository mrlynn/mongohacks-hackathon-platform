import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { ProjectModel } from "@/lib/db/models/Project";
import "@/lib/db/models/Team";
import "@/lib/db/models/Event";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const projects = await ProjectModel.find({
      featured: true,
      status: { $in: ["submitted", "judged"] },
    })
      .populate("teamId", "name")
      .populate("eventId", "name")
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error("GET /api/gallery error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch featured projects" },
      { status: 500 }
    );
  }
}
