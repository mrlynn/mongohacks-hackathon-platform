import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { FeedbackResponseModel } from "@/lib/db/models/FeedbackResponse";
import "@/lib/db/models/FeedbackFormConfig";

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

    const responses = await FeedbackResponseModel.find(query)
      .populate("formId", "name slug")
      .sort({ submittedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      responses: JSON.parse(JSON.stringify(responses)),
    });
  } catch (error) {
    console.error(
      "GET /api/admin/events/[eventId]/feedback-responses error:",
      error
    );
    return NextResponse.json(
      { success: false, error: "Failed to fetch feedback responses" },
      { status: 500 }
    );
  }
}
