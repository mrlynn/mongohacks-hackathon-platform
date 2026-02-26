import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";
import { ParticipantModel } from "@/lib/db/models/Participant";

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
    const userId = (session.user as any).id;

    const participant = await ParticipantModel.findOne({ userId }).lean();

    return NextResponse.json({
      success: true,
      participant: participant
        ? {
            bio: (participant as any).bio || "",
            skills: (participant as any).skills || [],
            experience_level: (participant as any).experience_level || "intermediate",
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
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
    const userId = (session.user as any).id;
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
        email: (session.user as any).email,
        name: name || (session.user as any).name,
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
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
