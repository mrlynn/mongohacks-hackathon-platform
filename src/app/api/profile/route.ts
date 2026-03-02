import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { apiLogger } from "@/lib/logger";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const userId = session.user.id;

    const participant = await ParticipantModel.findOne({ userId }).lean();

    interface ParticipantProfile { bio?: string; skills?: string[]; experience_level?: string }
    const profile = participant as unknown as ParticipantProfile | null;

    return NextResponse.json({
      success: true,
      participant: profile
        ? {
            bio: profile.bio || "",
            skills: profile.skills || [],
            experience_level: profile.experience_level || "intermediate",
          }
        : null,
    });
  } catch (error) {
    apiLogger.error({ err: error }, "Error fetching profile");
    return NextResponse.json(
      { success: false, message: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const userId = session.user.id;
    const body = await request.json();

    const { name, bio, skills, interests, experience_level } = body;

    // Update user name
    if (name) {
      await UserModel.findByIdAndUpdate(userId, { name });
    }

    // Update or create participant profile
    const participant = await ParticipantModel.findOne({ userId });

    if (participant) {
      // Update existing participant
      participant.bio = bio || "";
      participant.skills = skills || [];
      participant.interests = interests || [];
      participant.experience_level = experience_level || "beginner";
      await participant.save();
    } else {
      // Create new participant profile
      await ParticipantModel.create({
        userId,
        email: session.user.email,
        name: name || session.user.name,
        bio: bio || "",
        skills: skills || [],
        interests: interests || [],
        experience_level: experience_level || "beginner",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    apiLogger.error({ err: error }, "Error updating profile");
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
