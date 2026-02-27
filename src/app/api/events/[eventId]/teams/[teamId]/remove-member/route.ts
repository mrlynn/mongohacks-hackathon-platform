import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { TeamModel } from "@/lib/db/models/Team";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; teamId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { teamId } = await params;
    const userId = (session.user as { id: string }).id;
    const { memberId } = await request.json();

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: "Member ID is required" },
        { status: 400 }
      );
    }

    const team = await TeamModel.findById(teamId);

    if (!team) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    // Only the leader can remove members
    if (team.leaderId.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: "Only the team leader can remove members" },
        { status: 403 }
      );
    }

    // Can't remove yourself (use leave or disband instead)
    if (memberId === userId) {
      return NextResponse.json(
        { success: false, error: "Cannot remove yourself. Use leave team instead." },
        { status: 400 }
      );
    }

    // Check that member is actually on the team
    const memberIndex = team.members.findIndex(
      (m: any) => m.toString() === memberId
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { success: false, error: "User is not a member of this team" },
        { status: 400 }
      );
    }

    team.members.splice(memberIndex, 1);

    // Re-open team for members if below capacity
    if (team.members.length < team.maxMembers) {
      team.lookingForMembers = true;
    }

    await team.save();

    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
