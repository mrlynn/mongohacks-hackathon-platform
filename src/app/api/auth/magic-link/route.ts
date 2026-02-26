import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";
import { sendEmail } from "@/lib/email/email-service";
import { magicLinkEmail } from "@/lib/email/templates";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    await connectToDatabase();

    // Find or create user
    let user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      user = await UserModel.create({
        email: normalizedEmail,
        name: normalizedEmail.split("@")[0],
        needsPasswordSetup: true,
        role: "participant",
      });
    }

    // Generate token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Store hashed token with 15-minute expiry
    await UserModel.findByIdAndUpdate(user._id, {
      magicLinkToken: hashedToken,
      magicLinkExpiry: new Date(Date.now() + 15 * 60 * 1000),
    });

    // Build verify URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/api/auth/magic-link/verify?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;

    // Send email
    const template = magicLinkEmail(user.name, verifyUrl);
    sendEmail({
      to: normalizedEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "If an account exists, a magic link has been sent to your email.",
    });
  } catch (error) {
    console.error("Magic link request error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
