import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";

const createUserSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["participant", "organizer", "judge", "admin", "super_admin"]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    await connectToDatabase();

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 422 }
      );
    }

    // Escalation guard: only super_admin can create super_admin users
    if (parsed.data.role === "super_admin") {
      const currentRole = (session.user as { role?: string }).role;
      if (currentRole !== "super_admin") {
        return NextResponse.json(
          { success: false, error: "Only super admins can create super admin users" },
          { status: 403 }
        );
      }
    }

    const existing = await UserModel.findOne({
      email: parsed.data.email.toLowerCase(),
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const user = await UserModel.create({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash,
      role: parsed.data.role,
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
