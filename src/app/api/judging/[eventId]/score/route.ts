import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { ScoreModel } from "@/lib/db/models/Score";
import { ProjectModel } from "@/lib/db/models/Project";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== "judge" && userRole !== "admin") {
      return NextResponse.json(
        { success: false, error: "Only judges can submit scores" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { eventId } = await params;
    const userId = (session.user as { id: string }).id;
    const body = await request.json();

    const { projectId, innovation, technical, impact, presentation, comments } = body;

    // Validate scores
    const scores = { innovation, technical, impact, presentation };
    for (const [key, value] of Object.entries(scores)) {
      if (typeof value !== "number" || value < 1 || value > 10) {
        return NextResponse.json(
          {
            success: false,
            message: `${key} score must be between 1 and 10`,
          },
          { status: 422 }
        );
      }
    }

    // Verify project exists and belongs to event
    const project = await ProjectModel.findOne({
      _id: projectId,
      eventId,
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    // Update or create score (upsert)
    const score = await ScoreModel.findOneAndUpdate(
      {
        projectId,
        judgeId: userId,
      },
      {
        $set: {
          eventId,
          scores,
          comments: comments || "",
          submittedAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    // Update project status to under_review if not already judged
    if (project.status === "submitted") {
      project.status = "under_review";
      await project.save();
    }

    return NextResponse.json({
      success: true,
      message: "Score submitted successfully",
      score: {
        _id: score._id.toString(),
        totalScore: score.totalScore,
      },
    });
  } catch (error) {
    console.error("Error submitting score:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit score" },
      { status: 500 }
    );
  }
}
