import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { FeedbackResponseModel } from "@/lib/db/models/FeedbackResponse";
import "@/lib/db/models/FeedbackFormConfig";
import { apiLogger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { eventId } = await params;
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get("formId");

    const query: Record<string, string> = { eventId };
    if (formId) {
      query.formId = formId;
    }

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const [responses, total] = await Promise.all([
      FeedbackResponseModel.find(query)
        .populate("formId", "name slug")
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FeedbackResponseModel.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      responses: JSON.parse(JSON.stringify(responses)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    apiLogger.error({ err: error }, "GET /api/admin/events/[eventId]/feedback-responses error");
    return NextResponse.json(
      { success: false, error: "Failed to fetch feedback responses" },
      { status: 500 }
    );
  }
}
