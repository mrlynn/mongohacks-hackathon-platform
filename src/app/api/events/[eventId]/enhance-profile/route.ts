import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { ParticipantModel } from "@/lib/db/models/Participant";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = await request.json();

    // Accept either authenticated session or participantId from quick-register
    const participantId = body.participantId;
    if (!participantId) {
      return NextResponse.json(
        { success: false, message: "Participant ID is required" },
        { status: 422 }
      );
    }

    await connectToDatabase();

    const participant = await ParticipantModel.findById(participantId);
    if (!participant) {
      return NextResponse.json(
        { success: false, message: "Participant not found" },
        { status: 404 }
      );
    }

    // Verify participant is registered for this event
    const isRegistered = participant.registeredEvents.some(
      (re: { eventId: import("mongoose").Types.ObjectId }) =>
        re.eventId.toString() === eventId
    );
    if (!isRegistered) {
      return NextResponse.json(
        { success: false, message: "Not registered for this event" },
        { status: 403 }
      );
    }

    // Update Tier 2 standard fields
    if (body.skills && Array.isArray(body.skills)) {
      participant.skills = body.skills;
    }
    if (body.githubUsername !== undefined) {
      participant.bio = participant.bio
        ? `${participant.bio}\nGitHub: ${body.githubUsername}`
        : `GitHub: ${body.githubUsername}`;
    }
    if (body.bio !== undefined) {
      participant.bio = body.bio;
    }

    // Update Tier 3 custom responses
    if (body.customResponses && typeof body.customResponses === "object") {
      for (const [key, value] of Object.entries(body.customResponses)) {
        participant.customResponses.set(key, value);
      }
    }

    await participant.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated",
      participantId: participant._id.toString(),
    });
  } catch (error) {
    console.error("Enhance profile error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
