import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { TeamModel } from "@/lib/db/models/Team";
import { ParticipantModel } from "@/lib/db/models/Participant";

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
    const { eventId, teamId } = await params;
    const userId = (session.user as { id: string }).id;

    // Check user is registered for this event
    const participant = await ParticipantModel.findOne({
      userId,
      "registeredEvents.eventId": eventId,
    });

    if (!participant) {
      return NextResponse.json(
        { success: false, error: "You must be registered for this event" },
        { status: 403 }
      );
    }

    // Check if user already in a team for this event
    const existingTeam = await TeamModel.findOne({
      eventId,
      members: userId,
    });

    if (existingTeam) {
      return NextResponse.json(
        { success: false, error: "You are already in a team for this event" },
        { status: 400 }
      );
    }

    // Find team and check capacity
    const team = await TeamModel.findById(teamId);

    if (!team) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    if (team.members.length >= team.maxMembers) {
      return NextResponse.json(
        { success: false, error: "Team is full" },
        { status: 400 }
      );
    }

    // Add user to team and update participant's teamId
    team.members.push(userId as any);
    await team.save();

    participant.teamId = team._id;
    await participant.save();

    return NextResponse.json({
      success: true,
      message: "Successfully joined team",
      team: {
        ...team.toObject(),
        _id: team._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error joining team:", error);
    return NextResponse.json(
      { success: false, error: "Failed to join team" },
      { status: 500 }
    );
  }
}
