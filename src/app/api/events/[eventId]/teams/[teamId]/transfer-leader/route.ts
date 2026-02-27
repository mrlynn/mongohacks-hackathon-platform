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
    const { newLeaderId } = await request.json();

    if (!newLeaderId) {
      return NextResponse.json(
        { success: false, error: "New leader ID is required" },
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

    // Only the current leader can transfer leadership
    if (team.leaderId.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: "Only the team leader can transfer leadership" },
        { status: 403 }
      );
    }

    // New leader must be a team member
    const isMember = team.members.some(
      (memberId: any) => memberId.toString() === newLeaderId
    );

    if (!isMember) {
      return NextResponse.json(
        { success: false, error: "New leader must be a team member" },
        { status: 400 }
      );
    }

    // Can't transfer to yourself
    if (newLeaderId === userId) {
      return NextResponse.json(
        { success: false, error: "You are already the leader" },
        { status: 400 }
      );
    }

    team.leaderId = newLeaderId;
    await team.save();

    return NextResponse.json({
      success: true,
      message: "Leadership transferred successfully",
    });
  } catch (error) {
    console.error("Error transferring leadership:", error);
    return NextResponse.json(
      { success: false, error: "Failed to transfer leadership" },
      { status: 500 }
    );
  }
}
