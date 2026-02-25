import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { ParticipantModel } from "@/lib/db/models/Participant";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { eventId } = await params;

    // Find all participants registered for this event
    const participants = await ParticipantModel.find({
      "registeredEvents.eventId": eventId,
    })
      .populate("userId", "email name")
      .lean();

    // Extract registration details
    const registrations = participants.map((participant) => {
      const registration = participant.registeredEvents.find(
        (reg: any) => reg.eventId.toString() === eventId
      );

      return {
        _id: participant._id.toString(),
        userId: participant.userId,
        name: participant.name,
        email: participant.email,
        bio: participant.bio,
        skills: participant.skills,
        experienceLevel: participant.experience_level,
        registrationDate: registration?.registrationDate?.toISOString(),
        status: registration?.status || "registered",
        teamId: participant.teamId?.toString() || null,
      };
    });

    return NextResponse.json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
