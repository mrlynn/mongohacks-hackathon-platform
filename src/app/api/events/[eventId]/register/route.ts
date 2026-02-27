import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { UserModel } from "@/lib/db/models/User";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { z } from "zod";
import { generateEmbedding } from "@/lib/ai/embedding-service";
import { notifyRegistrationConfirmed } from "@/lib/notifications/notification-service";

const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  skills: z.array(z.string()).min(1, "Select at least one skill").max(10).default([]),
  // Extended fields from registration form config
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  github: z.string().optional(),
  bio: z.string().max(1000).optional(),
  customAnswers: z.record(z.string(), z.unknown()).optional(),
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

    // Check event status is open for registration
    if (event.status !== "open") {
      return NextResponse.json(
        {
          success: false,
          error:
            event.status === "draft"
              ? "This event is not yet open for registration"
              : "This event is no longer accepting registrations",
        },
        { status: 400 }
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

      // Use a transaction to atomically create User + Participant
      // so we don't end up with orphaned User records on failure
      const dbSession = await mongoose.startSession();
      try {
        let newParticipant: any;
        await dbSession.withTransaction(async () => {
          const passwordHash = await bcrypt.hash(data.password!, 12);
          const [createdUser] = await UserModel.create(
            [
              {
                email: data.email.toLowerCase(),
                name: data.name,
                passwordHash,
                role: "participant",
                needsPasswordSetup: false,
              },
            ],
            { session: dbSession }
          );
          user = createdUser;

          const eventCustomData: Record<string, unknown> = {
            ...(data.github && { github: data.github }),
            ...(data.customAnswers || {}),
          };

          const [createdParticipant] = await ParticipantModel.create(
            [
              {
                userId: createdUser._id,
                email: data.email.toLowerCase(),
                name: data.name,
                skills: data.skills,
                ...(data.experienceLevel && { experience_level: data.experienceLevel }),
                ...(data.bio && { bio: data.bio }),
                ...(Object.keys(eventCustomData).length > 0
                  ? { customResponses: { [eventId]: eventCustomData } }
                  : {}),
                registeredEvents: [
                  {
                    eventId: eventId,
                    registrationDate: new Date(),
                    status: "registered",
                  },
                ],
              },
            ],
            { session: dbSession }
          );
          newParticipant = createdParticipant;
        });

        isNewUser = true;

        // Fire-and-forget: generate skills embedding for vector team matching
        if (data.skills?.length) {
          const skillText = data.skills.join(" ");
          generateEmbedding(skillText)
            .then((embedding) =>
              ParticipantModel.findByIdAndUpdate(newParticipant._id, {
                skillsEmbedding: embedding,
              }).catch(() => {})
            )
            .catch(() => {});
        }

        // Fire-and-forget: send registration confirmation notification
        notifyRegistrationConfirmed(user!._id.toString(), event.name, eventId);

        return NextResponse.json({
          success: true,
          message: "Successfully registered for the event!",
          data: {
            userId: user!._id,
            participantId: newParticipant._id,
            eventId,
            isNewUser: true,
          },
        });
      } finally {
        await dbSession.endSession();
      }
    }

    // Existing user path — check/create participant record
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

      // Update extended profile fields if provided
      if (data.experienceLevel) {
        participant.experience_level = data.experienceLevel;
      }
      if (data.bio) {
        participant.bio = data.bio;
      }

      // Merge custom answers (keyed by eventId to avoid collisions)
      const eventCustomData: Record<string, unknown> = {
        ...(data.github && { github: data.github }),
        ...(data.customAnswers || {}),
      };
      if (Object.keys(eventCustomData).length > 0) {
        if (!participant.customResponses) {
          participant.customResponses = new Map();
        }
        participant.customResponses.set(eventId, eventCustomData);
      }

      await participant.save();
    } else {
      // Existing user but no participant record yet
      participant = await ParticipantModel.create({
        userId: user!._id,
        email: data.email.toLowerCase(),
        name: data.name,
        skills: data.skills,
        ...(data.experienceLevel && { experience_level: data.experienceLevel }),
        ...(data.bio && { bio: data.bio }),
        ...(() => {
          const eventCustomData: Record<string, unknown> = {
            ...(data.github && { github: data.github }),
            ...(data.customAnswers || {}),
          };
          return Object.keys(eventCustomData).length > 0
            ? { customResponses: { [eventId]: eventCustomData } }
            : {};
        })(),
        registeredEvents: [
          {
            eventId: eventId,
            registrationDate: new Date(),
            status: "registered",
          },
        ],
      });
    }

    // Fire-and-forget: generate skills embedding for vector team matching
    if (data.skills?.length) {
      const skillText = data.skills.join(" ");
      generateEmbedding(skillText)
        .then((embedding) =>
          ParticipantModel.findByIdAndUpdate(participant!._id, {
            skillsEmbedding: embedding,
          }).catch(() => {})
        )
        .catch(() => {});
    }

    // Fire-and-forget: send registration confirmation notification
    notifyRegistrationConfirmed(user._id.toString(), event.name, eventId);

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
