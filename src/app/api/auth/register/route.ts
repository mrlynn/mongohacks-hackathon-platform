import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";
import { errorResponse, successResponse } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["participant", "organizer", "judge"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 422);
    }

    await connectToDatabase();

    const existingUser = await UserModel.findOne({
      email: parsed.data.email.toLowerCase(),
    });
    if (existingUser) {
      return errorResponse("Email already registered", 409);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const user = await UserModel.create({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash,
      role: parsed.data.role || "participant",
    });

    return successResponse(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      201
    );
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return errorResponse("Registration failed", 500);
  }
}
