import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { TeamModel } from "@/lib/db/models/Team";

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

    const formattedTeams = teams.map((team) => ({
      _id: team._id.toString(),
      name: team.name,
      description: team.description || "",
      event: (team.eventId as any)?.name || "Unknown Event",
      eventId: (team.eventId as any)?._id?.toString() || "",
      leader: (team.leaderId as any)?.name || "Unknown",
      leaderId: (team.leaderId as any)?._id?.toString() || "",
      memberCount: team.members?.length || 0,
      members: team.members?.map((m: any) => ({
        _id: m._id.toString(),
        name: m.name,
        email: m.email,
      })) || [],
      lookingForMembers: team.lookingForMembers || false,
      requiredSkills: team.requiredSkills || [],
      createdAt: team.createdAt?.toISOString() || new Date().toISOString(),
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
