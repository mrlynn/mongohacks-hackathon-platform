import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";
import { ParticipantModel } from "@/lib/db/models/Participant";

/**
 * DELETE /api/admin/users/[userId]
 * Soft delete a user (admin only)
 * Marks user as deleted but preserves data for audit trail
 */
export async function DELETE(
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

    await connectToDatabase();

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting super_admins
    if (user.role === "super_admin") {
      return NextResponse.json(
        { error: "Cannot delete super administrators" },
        { status: 403 }
      );
    }

    // Prevent non-super_admin from deleting admins
    if (user.role === "admin" && userRole !== "super_admin") {
      return NextResponse.json(
        { error: "Only super administrators can delete admins" },
        { status: 403 }
      );
    }

    // Soft delete: mark as deleted but preserve data
    user.deletedAt = new Date();
    user.banned = true; // Also ban to prevent login
    user.bannedReason = "Account deleted by administrator";
    await user.save();

    // Also mark participant record as deleted if exists
    await ParticipantModel.updateOne(
      { userId },
      { deletedAt: new Date() }
    );

    return NextResponse.json({
      success: true,
      message: "User soft deleted successfully",
      userId: user._id,
    });
  } catch (error) {
    console.error("DELETE /api/admin/users/[userId]:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
