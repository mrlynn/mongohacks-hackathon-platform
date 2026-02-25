import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";

const updateUserSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  email: z.string().email().optional(),
  role: z.enum(["participant", "organizer", "judge", "admin", "super_admin"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await requireAdmin();
    await connectToDatabase();

    const { userId } = await params;
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 422 }
      );
    }

    // Escalation guard: only super_admin can assign super_admin role
    if (parsed.data.role === "super_admin") {
      const currentRole = (session.user as { role?: string }).role;
      if (currentRole !== "super_admin") {
        return NextResponse.json(
          { success: false, error: "Only super admins can assign the super admin role" },
          { status: 403 }
        );
      }
    }

    const updates: Record<string, string> = {};
    if (parsed.data.name) updates.name = parsed.data.name;
    if (parsed.data.email) updates.email = parsed.data.email.toLowerCase();
    if (parsed.data.role) updates.role = parsed.data.role;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 422 }
      );
    }

    // Check email uniqueness if email is being changed
    if (updates.email) {
      const existing = await UserModel.findOne({
        email: updates.email,
        _id: { $ne: userId },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "Email already in use" },
          { status: 409 }
        );
      }
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select("-passwordHash");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/users/[userId] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}
