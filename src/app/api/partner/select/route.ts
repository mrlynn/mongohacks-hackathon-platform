import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/admin-guard";
import type { UserRole } from "@/lib/admin-guard";
import { partnerLogger } from "@/lib/logger";

/**
 * POST /api/partner/select
 * Sets the admin_selected_partner cookie so admins can browse the partner portal
 * as a specific partner organization.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as { role?: string };
    const role = (user?.role ?? "") as UserRole;

    if (!ADMIN_ROLES.includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { partnerId } = await request.json();
    if (!partnerId) {
      return NextResponse.json({ error: "partnerId is required" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_selected_partner", partnerId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    partnerLogger.error({ err: error }, "Partner select error")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/partner/select
 * Clears the admin partner selection cookie.
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_selected_partner");
  return response;
}
