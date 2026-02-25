import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { EventModel } from "@/lib/db/models/Event";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = await request.json();

    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, message: "Name and email are required" },
        { status: 422 }
      );
    }

    await connectToDatabase();

    const event = await EventModel.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    if (new Date(event.registrationDeadline) < now) {
      return NextResponse.json(
        { success: false, message: "Registration for this event has closed" },
        { status: 400 }
      );
    }

    const email = body.email.toLowerCase();
    const experienceLevel = body.experienceLevel || "beginner";
    const customResponses = body.customResponses || {};

    let user = await UserModel.findOne({ email });
    let participant;
    let isNewUser = false;

    if (user) {
      // Check if already registered for this event
      participant = await ParticipantModel.findOne({
        userId: user._id,
        "registeredEvents.eventId": eventId,
      });

      if (participant) {
        return NextResponse.json(
          {
            success: false,
            message: "You are already registered for this event",
            alreadyRegistered: true,
            participantId: participant._id.toString(),
          },
          { status: 409 }
        );
      }

      // Existing user, not registered — add event
      participant = await ParticipantModel.findOne({ userId: user._id });

      if (participant) {
        participant.registeredEvents.push({
          eventId: eventId as unknown as import("mongoose").Types.ObjectId,
          registrationDate: new Date(),
          status: "registered",
        });
        if (Object.keys(customResponses).length > 0) {
          for (const [key, value] of Object.entries(customResponses)) {
            participant.customResponses.set(key, value);
          }
        }
        await participant.save();
      } else {
        participant = await ParticipantModel.create({
          userId: user._id,
          email: user.email,
          name: user.name,
          experience_level: experienceLevel,
          customResponses,
          registeredEvents: [
            {
              eventId,
              registrationDate: new Date(),
              status: "registered",
            },
          ],
        });
      }
    } else {
      // New user — create without password
      isNewUser = true;

      const magicLinkToken = crypto.randomBytes(32).toString("hex");
      const magicLinkExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      user = await UserModel.create({
        email,
        name: body.name,
        needsPasswordSetup: true,
        magicLinkToken,
        magicLinkExpiry,
        role: "participant",
      });

      participant = await ParticipantModel.create({
        userId: user._id,
        email: user.email,
        name: user.name,
        experience_level: experienceLevel,
        customResponses,
        registeredEvents: [
          {
            eventId,
            registrationDate: new Date(),
            status: "registered",
          },
        ],
      });

      // TODO: Phase 4 — send magic link email
      // await sendMagicLinkEmail(email, magicLinkToken, event.landingPage?.slug);
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      userId: user._id.toString(),
      participantId: participant._id.toString(),
      isNewUser,
      tier: 1,
    });
  } catch (error: unknown) {
    console.error("Quick registration error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
