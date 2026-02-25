import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { RegistrationFormConfigModel } from "@/lib/db/models/RegistrationFormConfig";

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    const forms = await RegistrationFormConfigModel.find()
      .sort({ isBuiltIn: -1, name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      forms: JSON.parse(JSON.stringify(forms)),
    });
  } catch (error) {
    console.error("GET /api/admin/registration-forms error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch registration forms" },
      { status: 500 }
    );
  }
}

const customQuestionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["text", "select", "multiselect", "checkbox"]),
  options: z.array(z.string()).default([]),
  required: z.boolean().default(false),
  placeholder: z.string().default(""),
});

const createFormSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  description: z.string().max(500).optional(),

  tier1: z
    .object({
      showExperienceLevel: z.boolean().default(true),
      customQuestions: z.array(customQuestionSchema).max(2).default([]),
    })
    .optional(),

  tier2: z
    .object({
      enabled: z.boolean().default(true),
      prompt: z.string().max(200).optional(),
      showSkills: z.boolean().default(true),
      showGithub: z.boolean().default(true),
      showBio: z.boolean().default(true),
      customQuestions: z.array(customQuestionSchema).default([]),
    })
    .optional(),

  tier3: z
    .object({
      enabled: z.boolean().default(false),
      prompt: z.string().max(200).optional(),
      customQuestions: z.array(customQuestionSchema).default([]),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSuperAdmin();
    await connectToDatabase();

    const body = await request.json();
    const parsed = createFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 422 }
      );
    }

    const existing = await RegistrationFormConfigModel.findOne({
      slug: parsed.data.slug,
    });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "A registration form with this slug already exists",
        },
        { status: 409 }
      );
    }

    const userId = (session.user as { id?: string }).id;

    const form = await RegistrationFormConfigModel.create({
      ...parsed.data,
      isBuiltIn: false,
      createdBy: userId,
    });

    return NextResponse.json(
      {
        success: true,
        form: JSON.parse(JSON.stringify(form.toObject())),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/registration-forms error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create registration form" },
      { status: 500 }
    );
  }
}
