import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

import { authLogger } from "@/lib/logger";
export async function POST() {
  try {
    await signOut();
    return NextResponse.json({ success: true });
  } catch (error) {
    authLogger.error({ err: error }, "Sign out error");
    return NextResponse.json(
      { success: false, error: "Failed to sign out" },
      { status: 500 }
    );
  }
}
