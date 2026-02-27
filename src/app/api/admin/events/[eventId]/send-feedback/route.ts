import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { sendFeedbackRequests } from "@/lib/feedback/feedback-distribution";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { eventId } = await params;

    let audience: "participant" | "partner" | "both" = "both";
    try {
      const body = await request.json();
      if (
        body.audience === "participant" ||
        body.audience === "partner" ||
        body.audience === "both"
      ) {
        audience = body.audience;
      }
    } catch {
      // No body is fine, default to "both"
    }

    const result = await sendFeedbackRequests(eventId, audience);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "POST /api/admin/events/[eventId]/send-feedback error:",
      error
    );
    return NextResponse.json(
      { success: false, error: "Failed to send feedback requests" },
      { status: 500 }
    );
  }
}
