import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { TeamModel } from "@/lib/db/models/Team";
import { ParticipantModel } from "@/lib/db/models/Participant";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
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
    const { eventId } = await params;
    const body = await request.json();

    // Check if user already has a team for this event
    const existingTeam = await TeamModel.findOne({
      eventId,
      members: session.user.id,
    });

    if (existingTeam) {
      return NextResponse.json(
        { success: false, error: "You are already in a team for this event" },
        { status: 400 }
      );
    }

    // Create team with current user as leader and first member
    const team = new TeamModel({
      ...body,
      eventId,
      leaderId: session.user.id,
      members: [session.user.id],
      status: "forming",
    });

    await team.save();

    // Update participant's teamId
    await ParticipantModel.findOneAndUpdate(
      { userId: session.user.id, "registeredEvents.eventId": eventId },
      { $set: { teamId: team._id } }
    );

    return NextResponse.json({
      success: true,
      team: {
        ...team.toObject(),
        _id: team._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create team" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await connectToDatabase();
    const { eventId } = await params;

    const teams = await TeamModel.find({ eventId })
      .populate("members", "name email")
      .populate("leaderId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      teams: teams.map((team) => ({
        ...team.toObject(),
        _id: team._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
