import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { EmailTemplateModel } from "@/lib/db/models/EmailTemplate";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!role || (role !== "admin" && role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const template = await EmailTemplateModel.findById(id)
      .populate("updatedBy", "name")
      .lean();

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Email template GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const session = await auth();
    const user = session?.user as { role?: string; id?: string };
    if (!user?.role || (user.role !== "admin" && user.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const allowedFields = ["name", "description", "subject", "htmlBody", "textBody", "variables", "category"];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    updates.updatedBy = user.id;

    await connectToDatabase();

    const template = await EmailTemplateModel.findByIdAndUpdate(id, updates, { new: true })
      .populate("updatedBy", "name")
      .lean();

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Email template PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!role || (role !== "admin" && role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const template = await EmailTemplateModel.findById(id);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    if (template.isBuiltIn) {
      return NextResponse.json(
        { error: "Built-in templates cannot be deleted" },
        { status: 400 }
      );
    }

    await template.deleteOne();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email template DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
