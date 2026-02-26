import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!token || !email) {
    return NextResponse.redirect(`${baseUrl}/login?error=InvalidOrExpiredLink`);
  }

  try {
    await connectToDatabase();

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await UserModel.findOne({
      email: email.toLowerCase(),
    }).select("+magicLinkToken +magicLinkExpiry");

    if (
      !user ||
      !user.magicLinkToken ||
      !user.magicLinkExpiry ||
      user.magicLinkToken !== hashedToken ||
      user.magicLinkExpiry < new Date()
    ) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=InvalidOrExpiredLink`
      );
    }

    // Generate a short-lived callback token (60 seconds)
    const callbackToken = crypto.randomBytes(32).toString("hex");
    const hashedCallbackToken = crypto
      .createHash("sha256")
      .update(callbackToken)
      .digest("hex");

    user.magicLinkToken = hashedCallbackToken;
    user.magicLinkExpiry = new Date(Date.now() + 60 * 1000);
    await user.save();

    return NextResponse.redirect(
      `${baseUrl}/login?mode=magic-callback&callbackToken=${callbackToken}&email=${encodeURIComponent(email.toLowerCase())}`
    );
  } catch (error) {
    console.error("Magic link verify error:", error);
    return NextResponse.redirect(`${baseUrl}/login?error=InvalidOrExpiredLink`);
  }
}
