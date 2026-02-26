import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { NotificationModel } from "@/lib/db/models/Notification";

export async function PATCH() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as { id: string }).id;

    await connectToDatabase();
    await NotificationModel.updateMany({ userId, read: false }, { read: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
