import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin-guard";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { TemplateConfigModel } from "@/lib/db/models/TemplateConfig";

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    const templates = await TemplateConfigModel.find()
      .sort({ isBuiltIn: -1, name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      templates: JSON.parse(JSON.stringify(templates)),
    });
  } catch (error) {
    console.error("GET /api/admin/templates error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

const colorsSchema = z.object({
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
});

const typographySchema = z.object({
  headingFont: z.enum(["system", "serif", "mono"]),
  bodyFont: z.enum(["system", "serif", "mono"]),
  headingWeight: z.union([z.literal(600), z.literal(700), z.literal(800), z.literal(900)]),
  scale: z.enum(["compact", "default", "large"]),
});

const sectionSchema = z.object({
  type: z.enum(["hero", "about", "prizes", "schedule", "sponsors", "faq", "cta"]),
  enabled: z.boolean(),
  layout: z.string(),
  style: z.object({
    bgStyle: z.enum(["light", "dark", "primary", "gradient"]),
    spacing: z.enum(["compact", "default", "spacious"]),
  }),
});

const cardsSchema = z.object({
  borderRadius: z.union([z.literal(0), z.literal(8), z.literal(12), z.literal(16)]),
  style: z.enum(["shadow", "border", "flat", "glass"]),
  accentPosition: z.enum(["top", "left", "none"]),
});

const heroSchema = z.object({
  style: z.enum(["gradient", "solid", "image-overlay", "light"]),
  gradientDirection: z.string(),
  overlayOpacity: z.number().min(0).max(1),
  buttonStyle: z.enum(["rounded", "pill", "square"]),
});

const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().max(500).optional(),
  baseTemplate: z.string().optional(),
  colors: colorsSchema,
  typography: typographySchema,
  sections: z.array(sectionSchema).min(1),
  cards: cardsSchema,
  hero: heroSchema,
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSuperAdmin();
    await connectToDatabase();

    const body = await request.json();
    const parsed = createTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 422 }
      );
    }

    // Check slug uniqueness
    const existing = await TemplateConfigModel.findOne({ slug: parsed.data.slug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A template with this slug already exists" },
        { status: 409 }
      );
    }

    const userId = (session.user as { id?: string }).id;

    const template = await TemplateConfigModel.create({
      ...parsed.data,
      isBuiltIn: false,
      isDefault: false,
      createdBy: userId,
    });

    return NextResponse.json(
      {
        success: true,
        template: JSON.parse(JSON.stringify(template.toObject())),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/templates error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create template" },
      { status: 500 }
    );
  }
}
