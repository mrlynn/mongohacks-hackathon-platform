import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ requiresTwoFactor: false });
    }

    await connectToDatabase();
    const user = await UserModel.findOne({
      email: email.toLowerCase(),
    }).select("+twoFactorCode +twoFactorExpiry");

    if (
      !user ||
      !user.twoFactorEnabled ||
      !user.twoFactorCode ||
      !user.twoFactorExpiry ||
      user.twoFactorExpiry < new Date()
    ) {
      return NextResponse.json({ requiresTwoFactor: false });
    }

    return NextResponse.json({ requiresTwoFactor: true });
  } catch (error) {
    console.error("2FA status check error:", error);
    return NextResponse.json({ requiresTwoFactor: false });
  }
}
