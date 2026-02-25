import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { TemplateConfigModel } from "@/lib/db/models/TemplateConfig";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await params;

    // Try by ObjectId first, then by slug
    let template;
    if (mongoose.Types.ObjectId.isValid(id)) {
      template = await TemplateConfigModel.findById(id).lean();
    }
    if (!template) {
      template = await TemplateConfigModel.findOne({ slug: id }).lean();
    }

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template: JSON.parse(JSON.stringify(template)),
    });
  } catch (error) {
    console.error("GET /api/admin/templates/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    background: z.string(),
    surface: z.string(),
    text: z.string(),
    textSecondary: z.string(),
    heroBg: z.string(),
    heroBgEnd: z.string(),
    heroText: z.string(),
    buttonBg: z.string(),
    buttonText: z.string(),
  }).optional(),
  typography: z.object({
    headingFont: z.enum(["system", "serif", "mono"]),
    bodyFont: z.enum(["system", "serif", "mono"]),
    headingWeight: z.union([z.literal(600), z.literal(700), z.literal(800), z.literal(900)]),
    scale: z.enum(["compact", "default", "large"]),
  }).optional(),
  sections: z.array(z.object({
    type: z.enum(["hero", "about", "prizes", "schedule", "sponsors", "faq", "cta"]),
    enabled: z.boolean(),
    layout: z.string(),
    style: z.object({
      bgStyle: z.enum(["light", "dark", "primary", "gradient"]),
      spacing: z.enum(["compact", "default", "spacious"]),
    }),
  })).min(1).optional(),
  cards: z.object({
    borderRadius: z.union([z.literal(0), z.literal(8), z.literal(12), z.literal(16)]),
    style: z.enum(["shadow", "border", "flat", "glass"]),
    accentPosition: z.enum(["top", "left", "none"]),
  }).optional(),
  hero: z.object({
    style: z.enum(["gradient", "solid", "image-overlay", "light"]),
    gradientDirection: z.string(),
    overlayOpacity: z.number().min(0).max(1),
    buttonStyle: z.enum(["rounded", "pill", "square"]),
  }).optional(),
  isDefault: z.boolean().optional(),
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
    const parsed = updateTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 422 }
      );
    }

    let template;
    if (mongoose.Types.ObjectId.isValid(id)) {
      template = await TemplateConfigModel.findById(id);
    }
    if (!template) {
      template = await TemplateConfigModel.findOne({ slug: id });
    }

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    // If setting as default, unset current default
    if (parsed.data.isDefault === true) {
      await TemplateConfigModel.updateMany(
        { isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    // Apply updates
    const updateData = parsed.data;
    Object.assign(template, updateData);
    await template.save();

    return NextResponse.json({
      success: true,
      template: JSON.parse(JSON.stringify(template.toObject())),
    });
  } catch (error) {
    console.error("PATCH /api/admin/templates/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update template" },
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

    let template;
    if (mongoose.Types.ObjectId.isValid(id)) {
      template = await TemplateConfigModel.findById(id);
    }
    if (!template) {
      template = await TemplateConfigModel.findOne({ slug: id });
    }

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    if (template.isBuiltIn) {
      return NextResponse.json(
        { success: false, error: "Built-in templates cannot be deleted" },
        { status: 403 }
      );
    }

    await template.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/templates/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
