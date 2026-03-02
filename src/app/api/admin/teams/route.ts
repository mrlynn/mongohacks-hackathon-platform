import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { TeamModel } from "@/lib/db/models/Team";
import { serializeDocs } from "@/lib/utils/serialize";
import { apiLogger } from "@/lib/logger";

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

    interface PopulatedRef { _id?: string; name?: string; email?: string }
    interface SerializedTeam {
      _id: string;
      name: string;
      description?: string;
      eventId?: PopulatedRef | string;
      leaderId?: PopulatedRef | string;
      members?: unknown[];
      lookingForMembers?: boolean;
      requiredSkills?: string[];
      createdAt?: string;
    }

    const formattedTeams = serialized.map((t: unknown) => {
      const team = t as SerializedTeam;
      const eventRef = typeof team.eventId === 'object' ? team.eventId as PopulatedRef : null;
      const leaderRef = typeof team.leaderId === 'object' ? team.leaderId as PopulatedRef : null;
      return {
        _id: team._id,
        name: team.name,
        description: team.description || "",
        event: eventRef?.name || "Unknown Event",
        eventId: eventRef?._id || team.eventId || "",
        leader: leaderRef?.name || "Unknown",
        leaderId: leaderRef?._id || team.leaderId || "",
        memberCount: team.members?.length || 0,
        members: team.members || [],
        lookingForMembers: team.lookingForMembers || false,
        requiredSkills: team.requiredSkills || [],
        createdAt: team.createdAt || new Date().toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      teams: formattedTeams,
    });
  } catch (error) {
    apiLogger.error({ err: error }, "Error fetching teams");
    return NextResponse.json(
      { success: false, error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
