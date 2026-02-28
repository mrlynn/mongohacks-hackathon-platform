import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";

const BanSchema = z.object({
  reason: z.string().min(1).max(500).optional(),
});

/**
 * POST /api/admin/users/[userId]/ban
 * Toggle ban status for a user (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Admin authorization check
    const userRole = (session.user as any).role;
    if (!["admin", "super_admin"].includes(userRole)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { userId } = await params;
    const body = await request.json();

    const validationResult = BanSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent banning super_admins
    if (user.role === "super_admin") {
      return NextResponse.json(
        { error: "Cannot ban super administrators" },
        { status: 403 }
      );
    }

    // Prevent non-super_admin from banning admins
    if (user.role === "admin" && userRole !== "super_admin") {
      return NextResponse.json(
        { error: "Only super administrators can ban admins" },
        { status: 403 }
      );
    }

    // Toggle ban status
    if (user.banned) {
      // Unban
      user.banned = false;
      user.bannedAt = undefined;
      user.bannedReason = undefined;
    } else {
      // Ban
      user.banned = true;
      user.bannedAt = new Date();
      user.bannedReason = validationResult.data.reason || "No reason provided";
    }

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        banned: user.banned,
        bannedAt: user.bannedAt,
        bannedReason: user.bannedReason,
      },
    });
  } catch (error) {
    console.error("POST /api/admin/users/[userId]/ban:", error);
    return NextResponse.json(
      { error: "Failed to update ban status" },
      { status: 500 }
    );
  }
}
