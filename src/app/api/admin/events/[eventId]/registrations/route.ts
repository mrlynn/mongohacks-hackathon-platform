import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { serializeDoc } from "@/lib/utils/serialize";

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
      const serializedParticipant = serializeDoc(participant);
      const registration = serializedParticipant.registeredEvents.find(
        (reg: any) => reg.eventId === eventId
      );

      return {
        _id: serializedParticipant._id,
        userId: serializedParticipant.userId,
        name: serializedParticipant.name,
        email: serializedParticipant.email,
        bio: serializedParticipant.bio || "",
        skills: serializedParticipant.skills || [],
        experienceLevel: serializedParticipant.experience_level || "beginner",
        registrationDate: registration?.registrationDate || new Date().toISOString(),
        status: registration?.status || "registered",
        teamId: serializedParticipant.teamId || null,
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
