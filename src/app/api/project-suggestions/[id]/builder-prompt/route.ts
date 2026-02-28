import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { ProjectIdeaModel } from "@/lib/db/models/ProjectIdea";
import { EventModel } from "@/lib/db/models/Event";
import { TeamModel } from "@/lib/db/models/Team";
import { generateBuilderPrompt } from "@/lib/ai/builder-prompt-service";
import type { PromptVariant } from "@/lib/ai/builder-prompt-service";

const QuerySchema = z.object({
  variant: z
    .enum(["full-scaffold", "backend-first", "frontend-first"])
    .default("full-scaffold"),
});

/**
 * GET /api/project-suggestions/[id]/builder-prompt
 * Generate a builder prompt from a saved project idea
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const variant = (searchParams.get("variant") ||
      "full-scaffold") as PromptVariant;

    // Validate variant
    const validationResult = QuerySchema.safeParse({ variant });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid variant parameter" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Fetch the project idea
    const idea = await ProjectIdeaModel.findById(id);
    if (!idea) {
      return NextResponse.json(
        { error: "Project idea not found" },
        { status: 404 }
      );
    }

    // Authorization: user owns idea OR is member of idea's team
    const userId = (session.user as { id: string }).id;
    const isOwner = idea.userId.toString() === userId;

    let isTeamMember = false;
    if (idea.teamId) {
      const team = await TeamModel.findById(idea.teamId);
      if (team) {
        isTeamMember = team.members.some(
          (m: any) => m.userId.toString() === userId
        );
      }
    }

    if (!isOwner && !isTeamMember) {
      return NextResponse.json(
        { error: "You don't have access to this project idea" },
        { status: 403 }
      );
    }

    // Fetch the event for context
    const event = await EventModel.findById(idea.eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Generate the builder prompt
    const result = await generateBuilderPrompt({
      idea,
      event,
      variant: validationResult.data.variant,
      enhance: false,
    });

    // Update metadata (track generation)
    const metadataKey = `builderPrompts.${variant.replace(/-/g, "")}`;
    await ProjectIdeaModel.findByIdAndUpdate(id, {
      [`${metadataKey}.generatedAt`]: new Date(),
      [`${metadataKey}.enhanced`]: false,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("GET /api/project-suggestions/[id]/builder-prompt:", error);
    return NextResponse.json(
      { error: "Failed to generate builder prompt" },
      { status: 500 }
    );
  }
}

const EnhanceSchema = z.object({
  variant: z
    .enum(["full-scaffold", "backend-first", "frontend-first"])
    .default("full-scaffold"),
});

/**
 * POST /api/project-suggestions/[id]/builder-prompt
 * Generate an AI-enhanced builder prompt (uses GPT-4o)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = EnhanceSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { variant } = validationResult.data;

    await connectToDatabase();

    // Fetch the project idea
    const idea = await ProjectIdeaModel.findById(id);
    if (!idea) {
      return NextResponse.json(
        { error: "Project idea not found" },
        { status: 404 }
      );
    }

    // Authorization check
    const userId = (session.user as { id: string }).id;
    const isOwner = idea.userId.toString() === userId;

    let isTeamMember = false;
    if (idea.teamId) {
      const team = await TeamModel.findById(idea.teamId);
      if (team) {
        isTeamMember = team.members.some(
          (m: any) => m.userId.toString() === userId
        );
      }
    }

    if (!isOwner && !isTeamMember) {
      return NextResponse.json(
        { error: "You don't have access to this project idea" },
        { status: 403 }
      );
    }

    // TODO: Rate limiting (3 enhanced prompts per user per event)
    // This would check a counter in the database

    // Fetch the event
    const event = await EventModel.findById(idea.eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Generate the enhanced builder prompt
    const result = await generateBuilderPrompt({
      idea,
      event,
      variant,
      enhance: true,
    });

    // Update metadata
    const metadataKey = `builderPrompts.${variant.replace(/-/g, "")}`;
    await ProjectIdeaModel.findByIdAndUpdate(id, {
      [`${metadataKey}.generatedAt`]: new Date(),
      [`${metadataKey}.enhanced`]: true,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("POST /api/project-suggestions/[id]/builder-prompt:", error);
    return NextResponse.json(
      { error: "Failed to generate enhanced builder prompt" },
      { status: 500 }
    );
  }
}
