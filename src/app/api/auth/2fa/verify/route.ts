import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "Email and code are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await UserModel.findOne({
      email: email.toLowerCase(),
    }).select("+twoFactorCode +twoFactorExpiry +magicLinkToken +magicLinkExpiry");

    if (!user || !user.twoFactorCode || !user.twoFactorExpiry) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired code" },
        { status: 400 }
      );
    }

    if (user.twoFactorExpiry < new Date()) {
      return NextResponse.json(
        { success: false, message: "Code has expired. Please try logging in again." },
        { status: 400 }
      );
    }

    const hashedCode = crypto
      .createHash("sha256")
      .update(code.toString())
      .digest("hex");

    if (hashedCode !== user.twoFactorCode) {
      return NextResponse.json(
        { success: false, message: "Invalid code" },
        { status: 400 }
      );
    }

    // Clear 2FA code
    user.twoFactorCode = undefined;
    user.twoFactorExpiry = undefined;

    // Generate a callback token to complete sign-in via magic-link provider
    const callbackToken = crypto.randomBytes(32).toString("hex");
    const hashedCallbackToken = crypto
      .createHash("sha256")
      .update(callbackToken)
      .digest("hex");

    user.magicLinkToken = hashedCallbackToken;
    user.magicLinkExpiry = new Date(Date.now() + 60 * 1000); // 60 seconds
    await user.save();

    return NextResponse.json({
      success: true,
      callbackToken,
    });
  } catch (error) {
    console.error("2FA verify error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
