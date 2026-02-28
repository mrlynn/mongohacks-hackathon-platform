import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { ProjectIdeaModel } from "@/lib/db/models/ProjectIdea";

const TrackSchema = z.object({
  action: z.enum(["copy", "download"]),
  variant: z.enum(["full-scaffold", "backend-first", "frontend-first"]),
});

/**
 * POST /api/project-suggestions/[id]/builder-prompt/track
 * Track copy/download actions for analytics
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

    const validationResult = TrackSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { action, variant } = validationResult.data;

    await connectToDatabase();

    // Map variant to field name
    const fieldName =
      variant === "full-scaffold"
        ? "fullScaffold"
        : variant === "backend-first"
        ? "backendFirst"
        : "frontendFirst";

    const updateKey =
      action === "copy"
        ? `builderPrompts.${fieldName}.copyCount`
        : `builderPrompts.${fieldName}.downloadCount`;

    await ProjectIdeaModel.findByIdAndUpdate(id, {
      $inc: { [updateKey]: 1 },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/project-suggestions/[id]/builder-prompt/track:", error);
    return NextResponse.json(
      { error: "Failed to track action" },
      { status: 500 }
    );
  }
}
