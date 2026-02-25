import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await UserModel.findById(userId).select("-passwordHash").lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Store impersonation in session (cookie)
    const response = NextResponse.json({
      success: true,
      message: `Now viewing as ${user.name}`,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Set impersonation cookie (1 hour expiry)
    response.cookies.set("impersonate_user_id", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600, // 1 hour
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error impersonating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to impersonate user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    const response = NextResponse.json({
      success: true,
      message: "Stopped impersonation",
    });

    // Clear impersonation cookie
    response.cookies.delete("impersonate_user_id");

    return response;
  } catch (error) {
    console.error("Error stopping impersonation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to stop impersonation" },
      { status: 500 }
    );
  }
}
