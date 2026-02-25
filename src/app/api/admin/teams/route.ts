import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { TeamModel } from "@/lib/db/models/Team";
import { serializeDocs } from "@/lib/utils/serialize";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const teams = await TeamModel.find()
      .populate("leaderId", "name email")
      .populate("members", "name email")
      .populate("eventId", "name")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const serialized = serializeDocs(teams);

    const formattedTeams = serialized.map((team: any) => ({
      _id: team._id,
      name: team.name,
      description: team.description || "",
      event: team.eventId?.name || "Unknown Event",
      eventId: team.eventId?._id || team.eventId || "",
      leader: team.leaderId?.name || "Unknown",
      leaderId: team.leaderId?._id || team.leaderId || "",
      memberCount: team.members?.length || 0,
      members: team.members || [],
      lookingForMembers: team.lookingForMembers || false,
      requiredSkills: team.requiredSkills || [],
      createdAt: team.createdAt || new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      teams: formattedTeams,
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
