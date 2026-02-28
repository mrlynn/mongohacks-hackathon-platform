import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";
import { sendEmail } from "@/lib/email/email-service";
import { emailVerificationEmail } from "@/lib/email/templates";

const ResendSchema = z.object({
  email: z.string().email().optional(),
});

/**
 * POST /api/auth/resend-verification
 * Resend email verification link
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    const validationResult = ResendSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let user;

    // If user is logged in, use their email
    if (session?.user?.email) {
      user = await UserModel.findOne({ email: session.user.email });
    }
    // Otherwise, use provided email
    else if (validationResult.data.email) {
      user = await UserModel.findOne({ email: validationResult.data.email });
    } else {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    if (!user) {
      // Don't reveal if email exists or not (security)
      return NextResponse.json({
        message: "If that email is registered, a verification link has been sent.",
      });
    }

    // Already verified
    if (user.emailVerified) {
      return NextResponse.json({
        message: "Email already verified",
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpiry = verificationExpiry;
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${verificationToken}`;
    const emailContent = emailVerificationEmail(user.name, verificationUrl);

    sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    }).catch((err) => {
      console.error("Failed to send verification email:", err);
    });

    return NextResponse.json({
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (error) {
    console.error("POST /api/auth/resend-verification:", error);
    return NextResponse.json(
      { error: "Failed to resend verification email" },
      { status: 500 }
    );
  }
}
