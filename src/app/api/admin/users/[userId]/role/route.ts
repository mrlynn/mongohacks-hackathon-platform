import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await requireAdmin();
    await connectToDatabase();

    const { userId } = await params;
    const body = await request.json();
    const { role } = body;

    // Validate role
    const validRoles = ["participant", "mentor", "judge", "organizer", "marketer", "admin", "super_admin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
        },
        { status: 422 }
      );
    }

    // Escalation guard: only super_admin can assign super_admin role
    if (role === "super_admin") {
      const currentRole = (session.user as { role?: string }).role;
      if (currentRole !== "super_admin") {
        return NextResponse.json(
          { success: false, message: "Only super admins can assign the super admin role" },
          { status: 403 }
        );
      }
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { role } },
      { new: true }
    ).select("_id email name role");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
