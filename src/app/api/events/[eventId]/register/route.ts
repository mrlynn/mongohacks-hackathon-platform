import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { UserModel } from "@/lib/db/models/User";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { z } from "zod";

const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  skills: z.array(z.string()).min(1, "Select at least one skill").max(10).default([]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await connectToDatabase();
    const { eventId } = await params;
    const body = await request.json();

    // Check if user is already authenticated
    const session = await auth();
    const isAuthenticated = !!session?.user;

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

    // Resolve the user account
    let user = await UserModel.findOne({ email: data.email.toLowerCase() });
    let isNewUser = false;

    if (user) {
      // User already exists — if they're already logged in, skip password check
      if (!isAuthenticated && user.passwordHash) {
        if (!data.password) {
          return NextResponse.json(
            {
              success: false,
              error: "An account with this email already exists. Please log in first.",
              code: "EXISTING_USER",
              loginUrl: `/login?redirect=/events/${eventId}/register`,
            },
            { status: 409 }
          );
        }
        // Verify the password
        const isValid = await bcrypt.compare(data.password, user.passwordHash);
        if (!isValid) {
          return NextResponse.json(
            {
              success: false,
              error: "Incorrect password. If you already have an account, please log in first.",
              code: "EXISTING_USER",
              loginUrl: `/login?redirect=/events/${eventId}/register`,
            },
            { status: 401 }
          );
        }
      }
    } else {
      // New user — password is required
      if (!data.password) {
        return NextResponse.json(
          {
            success: false,
            error: "Password is required for new accounts",
          },
          { status: 400 }
        );
      }

      const passwordHash = await bcrypt.hash(data.password, 12);
      user = await UserModel.create({
        email: data.email.toLowerCase(),
        name: data.name,
        passwordHash,
        role: "participant",
        needsPasswordSetup: false,
      });
      isNewUser = true;
    }

    // Check if participant already exists
    let participant = await ParticipantModel.findOne({ email: data.email.toLowerCase() });

    if (participant) {
      // Check if already registered for this event
      const alreadyRegistered = participant.registeredEvents.some(
        (reg: any) => reg.eventId.toString() === eventId
      );

      if (alreadyRegistered) {
        return NextResponse.json(
          {
            success: false,
            error: "You are already registered for this event",
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

      // Merge new skills
      if (data.skills && data.skills.length > 0) {
        participant.skills = [...new Set([...participant.skills, ...data.skills])];
      }

      await participant.save();
    } else {
      // Create new participant
      participant = await ParticipantModel.create({
        userId: user._id,
        email: data.email.toLowerCase(),
        name: data.name,
        skills: data.skills,
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
      message: "Successfully registered for the event!",
      data: {
        userId: user._id,
        participantId: participant._id,
        eventId,
        isNewUser,
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
