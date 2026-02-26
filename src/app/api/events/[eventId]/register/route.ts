import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { UserModel } from "@/lib/db/models/User";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { z } from "zod";

const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().optional().default(""),
  skills: z.array(z.string()).optional().default([]),
  interests: z.array(z.string()).optional().default([]),
  experience_level: z.enum(["beginner", "intermediate", "advanced"]).optional().default("beginner"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await connectToDatabase();
    const { eventId } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = registrationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if event exists and is open for registration
    const event = await EventModel.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Check registration deadline
    const now = new Date();
    if (event.registrationDeadline && now > new Date(event.registrationDeadline)) {
      return NextResponse.json(
        {
          success: false,
          error: "Registration deadline has passed",
        },
        { status: 400 }
      );
    }

    // Check capacity
    const registeredCount = await ParticipantModel.countDocuments({
      "registeredEvents.eventId": eventId,
    });

    if (event.capacity && registeredCount >= event.capacity) {
      return NextResponse.json(
        {
          success: false,
          error: "Event is at full capacity",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user = await UserModel.findOne({ email: data.email });
    
    if (!user) {
      // Create new user
      user = await UserModel.create({
        email: data.email,
        name: data.name,
        role: "participant",
        needsPasswordSetup: true, // They'll need to set password on first login
      });
    }

    // Check if participant already exists
    let participant = await ParticipantModel.findOne({ email: data.email });

    if (participant) {
      // Check if already registered for this event
      const alreadyRegistered = participant.registeredEvents.some(
        (reg) => reg.eventId.toString() === eventId
      );

      if (alreadyRegistered) {
        return NextResponse.json(
          {
            success: false,
            error: "You are already registered for this event",
            suggestion: "Try logging in instead: /login",
          },
          { status: 400 }
        );
      }

      // Add event to existing participant
      participant.registeredEvents.push({
        eventId: eventId as any,
        registrationDate: new Date(),
        status: "registered",
      });

      // Update profile info if provided
      if (data.bio) participant.bio = data.bio;
      if (data.skills && data.skills.length > 0) {
        participant.skills = [...new Set([...participant.skills, ...data.skills])];
      }
      if (data.interests && data.interests.length > 0) {
        participant.interests = [...new Set([...participant.interests, ...data.interests])];
      }
      if (data.experience_level) {
        participant.experience_level = data.experience_level;
      }

      await participant.save();
    } else {
      // Create new participant
      participant = await ParticipantModel.create({
        userId: user._id,
        email: data.email,
        name: data.name,
        bio: data.bio,
        skills: data.skills,
        interests: data.interests,
        experience_level: data.experience_level,
        registeredEvents: [
          {
            eventId: eventId,
            registrationDate: new Date(),
            status: "registered",
          },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      message: "Successfully registered for the event! 🎉",
      data: {
        userId: user._id,
        participantId: participant._id,
        eventId,
        needsPasswordSetup: user.needsPasswordSetup,
      },
    });
  } catch (error) {
    console.error("POST /api/events/[eventId]/register error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register for event" },
      { status: 500 }
    );
  }
}
