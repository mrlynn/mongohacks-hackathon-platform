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

    // httpOnly cookie for server-side session swapping
    response.cookies.set("impersonate_user_id", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600,
      path: "/",
    });

    // Client-readable cookie for the ImpersonationBanner UI
    response.cookies.set("impersonate_user_name", user.name, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600,
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

export async function DELETE() {
  try {
    await requireAdmin();

    const response = NextResponse.json({
      success: true,
      message: "Stopped impersonation",
    });

    // Clear cookies by setting them with maxAge: 0
    response.cookies.set("impersonate_user_id", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });

    response.cookies.set("impersonate_user_name", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error stopping impersonation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to stop impersonation" },
      { status: 500 }
    );
  }
}
