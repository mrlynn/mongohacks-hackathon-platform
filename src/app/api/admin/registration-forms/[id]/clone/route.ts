import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { RegistrationFormConfigModel } from "@/lib/db/models/RegistrationFormConfig";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSuperAdmin();
    await connectToDatabase();

    const { id } = await params;

    let source;
    if (mongoose.Types.ObjectId.isValid(id)) {
      source = await RegistrationFormConfigModel.findById(id).lean();
    }
    if (!source) {
      source = await RegistrationFormConfigModel.findOne({ slug: id }).lean();
    }

    if (!source) {
      return NextResponse.json(
        { success: false, error: "Registration form not found" },
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
    while (await RegistrationFormConfigModel.findOne({ slug: finalSlug })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const userId = (session.user as { id?: string }).id;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, createdAt, updatedAt, __v, ...formData } =
      source as Record<string, unknown>;

    const clone = await RegistrationFormConfigModel.create({
      ...formData,
      name,
      slug: finalSlug,
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
      "POST /api/admin/registration-forms/[id]/clone error:",
      error
    );
    return NextResponse.json(
      { success: false, error: "Failed to clone registration form" },
      { status: 500 }
    );
  }
}
