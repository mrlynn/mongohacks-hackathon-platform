import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { FeedbackFormConfigModel } from "@/lib/db/models/FeedbackFormConfig";

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    const forms = await FeedbackFormConfigModel.find()
      .sort({ isBuiltIn: -1, name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      forms: JSON.parse(JSON.stringify(forms)),
    });
  } catch (error) {
    console.error("GET /api/admin/feedback-forms error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch feedback forms" },
      { status: 500 }
    );
  }
}

const scaleConfigSchema = z.object({
  min: z.number().int().min(0).max(10).default(1),
  max: z.number().int().min(1).max(10).default(5),
  minLabel: z.string().max(50).default(""),
  maxLabel: z.string().max(50).default(""),
});

const feedbackQuestionSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "short_text",
    "long_text",
    "multiple_choice",
    "checkbox",
    "linear_scale",
    "rating",
  ]),
  label: z.string().min(1).max(500),
  description: z.string().max(1000).default(""),
  required: z.boolean().default(false),
  placeholder: z.string().max(200).default(""),
  options: z.array(z.string().max(200)).default([]),
  scaleConfig: scaleConfigSchema.optional(),
});

const feedbackSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(500).default(""),
  questions: z.array(feedbackQuestionSchema).min(1),
});

const createFeedbackFormSchema = z.object({
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
  targetAudience: z
    .enum(["participant", "partner", "both"])
    .default("participant"),
  sections: z.array(feedbackSectionSchema).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    await connectToDatabase();

    const body = await request.json();
    const parsed = createFeedbackFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 422 }
      );
    }

    const existing = await FeedbackFormConfigModel.findOne({
      slug: parsed.data.slug,
    });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "A feedback form with this slug already exists",
        },
        { status: 409 }
      );
    }

    const userId = (session.user as { id?: string }).id;

    const form = await FeedbackFormConfigModel.create({
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
    console.error("POST /api/admin/feedback-forms error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create feedback form" },
      { status: 500 }
    );
  }
}
