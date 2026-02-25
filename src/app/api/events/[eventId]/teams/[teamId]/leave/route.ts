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

    const team = await TeamModel.findById(teamId);

    if (!team) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    // Cannot leave if you're the leader and there are other members
    if (
      team.leaderId.toString() === session.user.id &&
      team.members.length > 1
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Team leader must transfer leadership before leaving",
        },
        { status: 400 }
      );
    }

    // Remove user from team
    team.members = team.members.filter(
      (memberId) => memberId.toString() !== session.user.id
    );

    // If team is empty, delete it
    if (team.members.length === 0) {
      await TeamModel.findByIdAndDelete(teamId);
      return NextResponse.json({
        success: true,
        message: "Left team and team was deleted (empty)",
      });
    }

    await team.save();

    return NextResponse.json({
      success: true,
      message: "Successfully left team",
    });
  } catch (error) {
    console.error("Error leaving team:", error);
    return NextResponse.json(
      { success: false, error: "Failed to leave team" },
      { status: 500 }
    );
  }
}
