import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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
    const userId = (session.user as { id: string }).id;
    const { enabled, password } = await request.json();

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Disabling requires password confirmation
    if (!enabled) {
      if (!password) {
        return NextResponse.json(
          { success: false, message: "Password is required to disable 2FA" },
          { status: 400 }
        );
      }
      if (!user.passwordHash) {
        return NextResponse.json(
          { success: false, message: "No password set on this account" },
          { status: 400 }
        );
      }
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { success: false, message: "Incorrect password" },
          { status: 400 }
        );
      }
    }

    user.twoFactorEnabled = enabled;
    await user.save();

    return NextResponse.json({
      success: true,
      message: enabled ? "Two-factor authentication enabled" : "Two-factor authentication disabled",
    });
  } catch (error) {
    console.error("2FA settings error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}

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
    const user = await UserModel.findById(userId).select("twoFactorEnabled");

    return NextResponse.json({
      success: true,
      twoFactorEnabled: user?.twoFactorEnabled || false,
    });
  } catch (error) {
    console.error("2FA settings GET error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
