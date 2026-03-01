import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";
import { PartnerModel } from "@/lib/db/models/Partner";
import { sendEmail } from "@/lib/email/email-service";
import { renderEmailTemplate } from "@/lib/email/template-renderer";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!role || (role !== "admin" && role !== "super_admin")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { partnerId, contactEmail, contactName } = await request.json();

    if (!partnerId || !contactEmail || !contactName) {
      return NextResponse.json(
        { success: false, message: "partnerId, contactEmail, and contactName are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = contactEmail.toLowerCase().trim();

    await connectToDatabase();

    // Verify partner exists
    const partner = await PartnerModel.findById(partnerId);
    if (!partner) {
      return NextResponse.json(
        { success: false, message: "Partner not found" },
        { status: 404 }
      );
    }

    // Find or create user with partner role
    let user = await UserModel.findOne({ email: normalizedEmail });
    if (user) {
      // Update existing user to partner role and link to partner org
      user.role = "partner";
      user.partnerId = partner._id;
      await user.save();
    } else {
      user = await UserModel.create({
        email: normalizedEmail,
        name: contactName,
        needsPasswordSetup: true,
        role: "partner",
        partnerId: partner._id,
      });
    }

    // Add contact to partner's contacts array if not already there
    const contactExists = partner.contacts.some(
      (c: { email: string }) => c.email.toLowerCase() === normalizedEmail
    );
    if (!contactExists) {
      partner.contacts.push({
        name: contactName,
        email: normalizedEmail,
        role: "Representative",
        isPrimary: partner.contacts.length === 0,
      });
      await partner.save();
    }

    // Generate magic link token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await UserModel.findByIdAndUpdate(user._id, {
      magicLinkToken: hashedToken,
      magicLinkExpiry: new Date(Date.now() + 15 * 60 * 1000),
    });

    // Build verify URL (reuses magic link verification flow)
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/api/auth/magic-link/verify?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;

    // Send invitation email
    const template = await renderEmailTemplate("partner_invite", { userName: contactName, companyName: partner.name, url: verifyUrl });
    sendEmail({
      to: normalizedEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${contactEmail}`,
    });
  } catch (error) {
    console.error("Partner invite error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
