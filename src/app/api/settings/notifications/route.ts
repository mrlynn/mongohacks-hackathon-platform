import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";

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
    const userId = (session.user as { id: string }).id;
    const user = await UserModel.findById(userId).select("notificationPreferences");

    return NextResponse.json({
      success: true,
      preferences: user?.notificationPreferences || {
        emailNotifications: true,
        eventReminders: true,
        teamInvites: true,
        projectUpdates: true,
        newsletter: false,
      },
    });
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch preferences" },
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
    const userId = (session.user as { id: string }).id;
    const body = await request.json();

    const preferences: Record<string, boolean> = {};
    const validKeys = [
      "emailNotifications",
      "eventReminders",
      "teamInvites",
      "projectUpdates",
      "newsletter",
    ];

    for (const key of validKeys) {
      if (typeof body[key] === "boolean") {
        preferences[`notificationPreferences.${key}`] = body[key];
      }
    }
    // Handle "newsletterSubscription" from the existing UI
    if (typeof body.newsletterSubscription === "boolean") {
      preferences["notificationPreferences.newsletter"] = body.newsletterSubscription;
    }

    await UserModel.findByIdAndUpdate(userId, { $set: preferences });

    return NextResponse.json({
      success: true,
      message: "Notification preferences saved",
    });
  } catch (error) {
    console.error("Error saving notification preferences:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save preferences" },
      { status: 500 }
    );
  }
}
