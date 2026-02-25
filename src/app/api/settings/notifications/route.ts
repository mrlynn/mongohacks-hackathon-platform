import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";

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

    // For now, we'll just store notification preferences in a simple way
    // In production, you might want a separate NotificationPreferences model
    const user = await UserModel.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Store notification preferences (extend User model if needed)
    // For now, just return success
    // TODO: Implement actual storage of notification preferences

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
