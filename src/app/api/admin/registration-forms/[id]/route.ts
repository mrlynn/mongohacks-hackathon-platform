import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { RegistrationFormConfigModel } from "@/lib/db/models/RegistrationFormConfig";
import mongoose from "mongoose";

function findFormByIdOrSlug(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return RegistrationFormConfigModel.findById(id);
  }
  return RegistrationFormConfigModel.findOne({ slug: id });
}

async function findFormByIdOrSlugLean(id: string) {
  let form;
  if (mongoose.Types.ObjectId.isValid(id)) {
    form = await RegistrationFormConfigModel.findById(id).lean();
  }
  if (!form) {
    form = await RegistrationFormConfigModel.findOne({ slug: id }).lean();
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
    const form = await findFormByIdOrSlugLean(id);

    if (!form) {
      return NextResponse.json(
        { success: false, error: "Registration form not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      form: JSON.parse(JSON.stringify(form)),
    });
  } catch (error) {
    console.error("GET /api/admin/registration-forms/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch registration form" },
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

const updateFormSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),

  tier1: z
    .object({
      showExperienceLevel: z.boolean(),
      customQuestions: z.array(customQuestionSchema).max(2),
    })
    .optional(),

  tier2: z
    .object({
      enabled: z.boolean(),
      prompt: z.string().max(200),
      showSkills: z.boolean(),
      showGithub: z.boolean(),
      showBio: z.boolean(),
      customQuestions: z.array(customQuestionSchema),
    })
    .optional(),

  tier3: z
    .object({
      enabled: z.boolean(),
      prompt: z.string().max(200),
      customQuestions: z.array(customQuestionSchema),
    })
    .optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    await connectToDatabase();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 422 }
      );
    }

    let form;
    if (mongoose.Types.ObjectId.isValid(id)) {
      form = await RegistrationFormConfigModel.findById(id);
    }
    if (!form) {
      form = await RegistrationFormConfigModel.findOne({ slug: id });
    }

    if (!form) {
      return NextResponse.json(
        { success: false, error: "Registration form not found" },
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
    console.error("PATCH /api/admin/registration-forms/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update registration form" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    await connectToDatabase();

    const { id } = await params;

    let form;
    if (mongoose.Types.ObjectId.isValid(id)) {
      form = await RegistrationFormConfigModel.findById(id);
    }
    if (!form) {
      form = await RegistrationFormConfigModel.findOne({ slug: id });
    }

    if (!form) {
      return NextResponse.json(
        { success: false, error: "Registration form not found" },
        { status: 404 }
      );
    }

    if (form.isBuiltIn) {
      return NextResponse.json(
        {
          success: false,
          error: "Built-in registration forms cannot be deleted",
        },
        { status: 403 }
      );
    }

    await form.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/registration-forms/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete registration form" },
      { status: 500 }
    );
  }
}
