import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { TemplateConfigModel } from "@/lib/db/models/TemplateConfig";
import { EventModel } from "@/lib/db/models/Event";
import mongoose from "mongoose";
import { apiLogger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await params;

    // Resolve template to get slug
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

    // Find events using this template (by slug)
    const events = await EventModel.find({
      "landingPage.template": template.slug,
    })
      .select("name status landingPage.slug landingPage.published startDate endDate")
      .sort({ startDate: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      events: JSON.parse(JSON.stringify(events)),
    });
  } catch (error) {
    apiLogger.error({ err: error }, "GET /api/admin/templates/[id]/events error");
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
