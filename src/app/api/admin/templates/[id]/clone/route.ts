import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { TemplateConfigModel } from "@/lib/db/models/TemplateConfig";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSuperAdmin();
    await connectToDatabase();

    const { id } = await params;

    // Find source template
    let source;
    if (mongoose.Types.ObjectId.isValid(id)) {
      source = await TemplateConfigModel.findById(id).lean();
    }
    if (!source) {
      source = await TemplateConfigModel.findOne({ slug: id }).lean();
    }

    if (!source) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    // Parse optional name/slug overrides from body
    let name = `${source.name} (Copy)`;
    let slug = `${source.slug}-copy`;
    try {
      const body = await request.json();
      if (body.name) name = body.name;
      if (body.slug) slug = body.slug;
    } catch {
      // No body is fine, use defaults
    }

    // Ensure slug uniqueness by appending number if needed
    let finalSlug = slug;
    let counter = 1;
    while (await TemplateConfigModel.findOne({ slug: finalSlug })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const userId = (session.user as { id?: string }).id;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, createdAt, updatedAt, __v, ...templateData } = source as Record<string, unknown>;

    const clone = await TemplateConfigModel.create({
      ...templateData,
      name,
      slug: finalSlug,
      isBuiltIn: false,
      isDefault: false,
      baseTemplate: source.slug,
      createdBy: userId,
    });

    return NextResponse.json(
      {
        success: true,
        template: JSON.parse(JSON.stringify(clone.toObject())),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/templates/[id]/clone error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clone template" },
      { status: 500 }
    );
  }
}
