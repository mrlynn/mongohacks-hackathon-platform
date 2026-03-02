import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { authLogger } from "@/lib/logger";
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      },
    });
  } catch (error) {
    authLogger.error({ err: error }, "Session fetch error");
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
