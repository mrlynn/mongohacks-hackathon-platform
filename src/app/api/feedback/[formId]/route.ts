import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/connection";
import { FeedbackFormConfigModel } from "@/lib/db/models/FeedbackFormConfig";
import { FeedbackResponseModel } from "@/lib/db/models/FeedbackResponse";
import { EventModel } from "@/lib/db/models/Event";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    await connectToDatabase();

    const { formId } = await params;
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const form = await FeedbackFormConfigModel.findById(formId).lean();
    if (!form) {
      return NextResponse.json(
        { success: false, error: "Feedback form not found" },
        { status: 404 }
      );
    }

    // Validate event assignment if eventId provided
    if (eventId) {
      const event = await EventModel.findById(eventId)
        .select("name feedbackForms")
        .lean();
      if (!event) {
        return NextResponse.json(
          { success: false, error: "Event not found" },
          { status: 404 }
        );
      }

      const feedbackForms = event.feedbackForms as
        | { participant?: { toString(): string }; partner?: { toString(): string } }
        | undefined;
      const isAssigned =
        feedbackForms?.participant?.toString() === formId ||
        feedbackForms?.partner?.toString() === formId;

      if (!isAssigned) {
        return NextResponse.json(
          {
            success: false,
            error: "This feedback form is not assigned to this event",
          },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        form: JSON.parse(JSON.stringify(form)),
        event: { _id: event._id, name: event.name },
      });
    }

    return NextResponse.json({
      success: true,
      form: JSON.parse(JSON.stringify(form)),
    });
  } catch (error) {
    console.error("GET /api/feedback/[formId] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch feedback form" },
      { status: 500 }
    );
  }
}

const submitResponseSchema = z.object({
  eventId: z.string().min(1),
  respondentEmail: z.string().email(),
  respondentName: z.string().min(1).max(200),
  respondentType: z.enum(["participant", "partner"]),
  answers: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.array(z.string())])
  ),
  startedAt: z.string().optional(),
});

const startFormSchema = z.object({
  eventId: z.string().min(1),
  respondentEmail: z.string().email(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    await connectToDatabase();

    const { formId } = await params;
    const body = await request.json();
    const parsed = submitResponseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 422 }
      );
    }

    // Verify form exists
    const form = await FeedbackFormConfigModel.findById(formId).lean();
    if (!form) {
      return NextResponse.json(
        { success: false, error: "Feedback form not found" },
        { status: 404 }
      );
    }

    // Verify event exists
    const event = await EventModel.findById(parsed.data.eventId)
      .select("feedbackForms")
      .lean();
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Validate required questions are answered
    const requiredQuestionIds: string[] = [];
    for (const section of form.sections) {
      for (const question of section.questions) {
        if (question.required) {
          requiredQuestionIds.push(question.id);
        }
      }
    }

    for (const qId of requiredQuestionIds) {
      const answer = parsed.data.answers[qId];
      if (answer === undefined || answer === "" || (Array.isArray(answer) && answer.length === 0)) {
        return NextResponse.json(
          { success: false, error: `Required question is missing an answer` },
          { status: 422 }
        );
      }
    }

    // Check for duplicate submission
    const existing = await FeedbackResponseModel.findOne({
      formId,
      eventId: parsed.data.eventId,
      respondentEmail: parsed.data.respondentEmail,
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already submitted a response for this form",
        },
        { status: 409 }
      );
    }

    // Calculate completion time if startedAt provided
    const now = new Date();
    let completionTimeMinutes: number | undefined;
    
    if (parsed.data.startedAt) {
      const startTime = new Date(parsed.data.startedAt);
      const diffMs = now.getTime() - startTime.getTime();
      completionTimeMinutes = Math.round(diffMs / (1000 * 60)); // Convert to minutes
    }

    await FeedbackResponseModel.create({
      formId,
      eventId: parsed.data.eventId,
      respondentEmail: parsed.data.respondentEmail,
      respondentName: parsed.data.respondentName,
      respondentType: parsed.data.respondentType,
      answers: parsed.data.answers,
      startedAt: parsed.data.startedAt ? new Date(parsed.data.startedAt) : undefined,
      submittedAt: now,
      completionTimeMinutes,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/feedback/[formId] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit feedback response" },
      { status: 500 }
    );
  }
}
