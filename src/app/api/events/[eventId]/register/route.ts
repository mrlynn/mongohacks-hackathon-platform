import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { EventModel } from "@/lib/db/models/Event";
import { signIn } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, and password are required",
        },
        { status: 422 }
      );
    }

    await connectToDatabase();

    // Check if event exists
    const event = await EventModel.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    // Check if event registration is closed
    const now = new Date();
    if (new Date(event.registrationDeadline) < now) {
      return NextResponse.json(
        {
          success: false,
          message: "Registration for this event has closed",
        },
        { status: 400 }
      );
    }

    const email = body.email.toLowerCase();

    // Check if user already exists
    let user = await UserModel.findOne({ email });

    if (user) {
      // User exists - check if they're already registered for this event
      const participant = await ParticipantModel.findOne({
        userId: user._id,
        "registeredEvents.eventId": eventId,
      });

      if (participant) {
        return NextResponse.json(
          {
            success: false,
            message: "You are already registered for this event",
          },
          { status: 409 }
        );
      }

      // User exists but not registered - add them to the event
      const existingParticipant = await ParticipantModel.findOne({
        userId: user._id,
      });

      if (existingParticipant) {
        // Update existing participant
        existingParticipant.registeredEvents.push({
          eventId: eventId as any,
          registrationDate: new Date(),
          status: "registered",
        });
        // Merge custom responses if provided
        if (body.customResponses) {
          for (const [key, val] of Object.entries(body.customResponses)) {
            existingParticipant.customResponses.set(key, val);
          }
        }
        await existingParticipant.save();
      } else {
        // Create new participant profile
        await ParticipantModel.create({
          userId: user._id,
          email: user.email,
          name: user.name,
          bio: body.bio || "",
          skills: body.skills || [],
          interests: [],
          experience_level: body.experienceLevel || "beginner",
          customResponses: body.customResponses || {},
          registeredEvents: [
            {
              eventId: eventId,
              registrationDate: new Date(),
              status: "registered",
            },
          ],
        });
      }
    } else {
      // New user - create user account
      const passwordHash = await bcrypt.hash(body.password, 10);

      user = await UserModel.create({
        email,
        name: body.name,
        passwordHash,
        role: "participant",
      });

      // Create participant profile
      await ParticipantModel.create({
        userId: user._id,
        email: user.email,
        name: user.name,
        bio: body.bio || "",
        skills: body.skills || [],
        interests: [],
        experience_level: body.experienceLevel || "beginner",
        customResponses: body.customResponses || {},
        registeredEvents: [
          {
            eventId: eventId,
            registrationDate: new Date(),
            status: "registered",
          },
        ],
      });
    }

    // Sign in the user
    await signIn("credentials", {
      email: body.email,
      password: body.password,
      redirect: false,
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      userId: user._id.toString(),
    });
  } catch (error: any) {
    console.error("Registration error:", error);

    // Handle specific errors
    if (error.code === 11000) {
      // Duplicate key error
      return NextResponse.json(
        {
          success: false,
          message: "Email already registered",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Registration failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
