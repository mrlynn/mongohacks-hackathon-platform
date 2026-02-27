import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { eventId } = await params;
    const event = await EventModel.findById(eventId)
      .select("feedbackForms")
      .populate("feedbackForms.participant", "name slug targetAudience")
      .populate("feedbackForms.partner", "name slug targetAudience")
      .lean();

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      feedbackForms: JSON.parse(
        JSON.stringify(event.feedbackForms || {})
      ),
    });
  } catch (error) {
    console.error(
      "GET /api/admin/events/[eventId]/feedback-forms error:",
      error
    );
    return NextResponse.json(
      { success: false, error: "Failed to fetch event feedback forms" },
      { status: 500 }
    );
  }
}

const updateSchema = z.object({
  participant: z.string().nullable().optional(),
  partner: z.string().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { eventId } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 422 }
      );
    }

    const event = await EventModel.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    if (!event.feedbackForms) {
      event.feedbackForms = {};
    }

    if (parsed.data.participant !== undefined) {
      event.feedbackForms.participant = parsed.data.participant || undefined;
    }
    if (parsed.data.partner !== undefined) {
      event.feedbackForms.partner = parsed.data.partner || undefined;
    }

    await event.save();

    return NextResponse.json({
      success: true,
      feedbackForms: JSON.parse(
        JSON.stringify(event.feedbackForms)
      ),
    });
  } catch (error) {
    console.error(
      "PATCH /api/admin/events/[eventId]/feedback-forms error:",
      error
    );
    return NextResponse.json(
      { success: false, error: "Failed to update event feedback forms" },
      { status: 500 }
    );
  }
}
