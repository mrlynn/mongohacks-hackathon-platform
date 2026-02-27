import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { FeedbackFormConfigModel } from "@/lib/db/models/FeedbackFormConfig";
import mongoose from "mongoose";

function findFormById(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return FeedbackFormConfigModel.findById(id);
  }
  return FeedbackFormConfigModel.findOne({ slug: id });
}

async function findFormByIdLean(id: string) {
  let form;
  if (mongoose.Types.ObjectId.isValid(id)) {
    form = await FeedbackFormConfigModel.findById(id).lean();
  }
  if (!form) {
    form = await FeedbackFormConfigModel.findOne({ slug: id }).lean();
  }
  return form;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await params;
    const form = await findFormByIdLean(id);

    if (!form) {
      return NextResponse.json(
        { success: false, error: "Feedback form not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      form: JSON.parse(JSON.stringify(form)),
    });
  } catch (error) {
    console.error("GET /api/admin/feedback-forms/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch feedback form" },
      { status: 500 }
    );
  }
}

const scaleConfigSchema = z.object({
  min: z.number().int().min(0).max(10),
  max: z.number().int().min(1).max(10),
  minLabel: z.string().max(50),
  maxLabel: z.string().max(50),
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
  description: z.string().max(1000),
  required: z.boolean(),
  placeholder: z.string().max(200),
  options: z.array(z.string().max(200)),
  scaleConfig: scaleConfigSchema.optional(),
});

const feedbackSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(500),
  questions: z.array(feedbackQuestionSchema).min(1),
});

const updateFeedbackFormSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  targetAudience: z.enum(["participant", "partner", "both"]).optional(),
  sections: z.array(feedbackSectionSchema).min(1).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateFeedbackFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 422 }
      );
    }

    const form = await findFormById(id);

    if (!form) {
      return NextResponse.json(
        { success: false, error: "Feedback form not found" },
        { status: 404 }
      );
    }

    Object.assign(form, parsed.data);
    await form.save();

    return NextResponse.json({
      success: true,
      form: JSON.parse(JSON.stringify(form.toObject())),
    });
  } catch (error) {
    console.error("PATCH /api/admin/feedback-forms/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update feedback form" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await params;

    let form;
    if (mongoose.Types.ObjectId.isValid(id)) {
      form = await FeedbackFormConfigModel.findById(id);
    }
    if (!form) {
      form = await FeedbackFormConfigModel.findOne({ slug: id });
    }

    if (!form) {
      return NextResponse.json(
        { success: false, error: "Feedback form not found" },
        { status: 404 }
      );
    }

    if (form.isBuiltIn) {
      return NextResponse.json(
        {
          success: false,
          error: "Built-in feedback forms cannot be deleted",
        },
        { status: 403 }
      );
    }

    await form.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/feedback-forms/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete feedback form" },
      { status: 500 }
    );
  }
}
