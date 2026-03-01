import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { EmailTemplateModel } from "@/lib/db/models/EmailTemplate";
import { seedEmailTemplates } from "@/lib/email/seed-email-templates";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!role || (role !== "admin" && role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    // Ensure built-in templates exist
    await seedEmailTemplates();

    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category");

    const filter: Record<string, string> = {};
    if (category) filter.category = category;

    const templates = await EmailTemplateModel.find(filter)
      .populate("updatedBy", "name")
      .sort({ category: 1, name: 1 })
      .lean();

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Email templates GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as { role?: string; id?: string };
    if (!user?.role || (user.role !== "admin" && user.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { key, name, category, description, subject, htmlBody, textBody, variables } = body;

    if (!key || !name || !category || !subject || !htmlBody || !textBody) {
      return NextResponse.json(
        { error: "key, name, category, subject, htmlBody, and textBody are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await EmailTemplateModel.findOne({ key });
    if (existing) {
      return NextResponse.json(
        { error: `Template with key "${key}" already exists` },
        { status: 409 }
      );
    }

    const template = await EmailTemplateModel.create({
      key,
      name,
      category,
      description: description || "",
      subject,
      htmlBody,
      textBody,
      variables: variables || [],
      isBuiltIn: false,
      updatedBy: user.id,
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Email templates POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
