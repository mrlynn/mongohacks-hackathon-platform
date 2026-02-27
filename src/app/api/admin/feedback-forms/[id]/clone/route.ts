import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { FeedbackFormConfigModel } from "@/lib/db/models/FeedbackFormConfig";
import mongoose from "mongoose";

// Recursively strip _id fields from plain objects (lean results may include them)
function stripIds(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(stripIds);
  if (obj && typeof obj === "object" && !(obj instanceof Date)) {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (key === "_id") continue;
      cleaned[key] = stripIds(value);
    }
    return cleaned;
  }
  return obj;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();

  try {
    await connectToDatabase();

    const { id } = await params;

    let source;
    if (mongoose.Types.ObjectId.isValid(id)) {
      source = await FeedbackFormConfigModel.findById(id).lean();
    }
    if (!source) {
      source = await FeedbackFormConfigModel.findOne({ slug: id }).lean();
    }

    if (!source) {
      return NextResponse.json(
        { success: false, error: "Feedback form not found" },
        { status: 404 }
      );
    }

    let name = `${source.name} (Copy)`;
    let slug = `${source.slug}-copy`;
    try {
      const body = await request.json();
      if (body.name) name = body.name;
      if (body.slug) slug = body.slug;
    } catch {
      // No body is fine, use defaults
    }

    // Ensure slug uniqueness
    let finalSlug = slug;
    let counter = 1;
    while (await FeedbackFormConfigModel.findOne({ slug: finalSlug })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const userId = (session.user as { id?: string }).id;

    // Clean sections: strip any _id fields from subdocuments
    const cleanSections = stripIds(source.sections);

    const clone = await FeedbackFormConfigModel.create({
      name,
      slug: finalSlug,
      description: source.description || "",
      targetAudience: source.targetAudience || "participant",
      sections: cleanSections,
      isBuiltIn: false,
      createdBy: userId,
    });

    return NextResponse.json(
      {
        success: true,
        form: JSON.parse(JSON.stringify(clone.toObject())),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/admin/feedback-forms/[id]/clone error:",
      error
    );
    return NextResponse.json(
      { success: false, error: "Failed to clone feedback form" },
      { status: 500 }
    );
  }
}
