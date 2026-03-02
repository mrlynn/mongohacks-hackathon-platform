import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";
import { PartnerAccessRequestModel } from "@/lib/db/models/PartnerAccessRequest";
import { partnerLogger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      contactName,
      contactEmail,
      password,
      companyName,
      companyDescription,
      website,
      industry,
      requestedEventIds,
    } = body;

    if (!contactName || !contactEmail || !password || !companyName || !companyDescription || !industry) {
      return NextResponse.json(
        { error: "contactName, contactEmail, password, companyName, companyDescription, and industry are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = contactEmail.toLowerCase().trim();

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      // Check if already a partner
      if (existingUser.role === "partner") {
        return NextResponse.json(
          { error: "An account with this email already has partner access" },
          { status: 409 }
        );
      }

      // Check for existing pending request
      const existingRequest = await PartnerAccessRequestModel.findOne({
        userId: existingUser._id,
        status: "pending",
      });
      if (existingRequest) {
        return NextResponse.json(
          { error: "You already have a pending partner access request" },
          { status: 409 }
        );
      }
    }

    // Create or get user
    let user = existingUser;
    if (!user) {
      const passwordHash = await bcrypt.hash(password, 12);
      user = await UserModel.create({
        email: normalizedEmail,
        name: contactName,
        passwordHash,
        role: "participant", // stays participant until approved
      });
    }

    // Create access request
    await PartnerAccessRequestModel.create({
      userId: user._id,
      newPartnerDetails: {
        companyName,
        description: companyDescription,
        website: website || undefined,
        industry,
      },
      requestedEventIds: requestedEventIds || [],
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      message: "Your partner access request has been submitted and is pending admin approval.",
    });
  } catch (error) {
    partnerLogger.error({ err: error }, "Partner registration error")
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
