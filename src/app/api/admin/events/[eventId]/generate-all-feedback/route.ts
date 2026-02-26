import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { ProjectModel } from "@/lib/db/models/Project";
import { ScoreModel } from "@/lib/db/models/Score";
import { synthesizeJudgeFeedback } from "@/lib/ai/feedback-service";

/**
 * POST — Batch generate AI feedback for all judged projects in an event.
 * Only generates feedback for projects that:
 * 1. Have judge scores
 * 2. Don't already have aiFeedback
 * 
 * Returns count of feedback generated.
 */
export async function POST(
  _request: NextRequest,
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
    if (!["admin", "organizer"].includes(userRole || "")) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { eventId } = await params;

    // Get all projects for this event that are submitted/judged
    const projects = await ProjectModel.find({
      eventId,
      status: { $in: ["submitted", "under_review", "judged"] },
      aiFeedback: { $exists: false }, // Only projects without feedback
    }).lean();

    if (projects.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All projects already have feedback",
        generated: 0,
        total: 0,
      });
    }

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    // Generate feedback for each project
    for (const project of projects) {
      try {
        // Get judge scores for this project
        const scores = await ScoreModel.find({
          projectId: project._id,
        }).lean();

        if (scores.length === 0) {
          // Skip projects with no scores
          continue;
        }

        // Generate AI feedback
        const feedback = await synthesizeJudgeFeedback({
          projectName: project.name,
          projectDescription: project.description,
          technologies: project.technologies,
          innovations: project.innovations,
          judgeScores: scores.map((s: any) => ({
            innovation: s.scores.innovation,
            technical: s.scores.technical,
            impact: s.scores.impact,
            presentation: s.scores.presentation,
            comments: s.comments,
          })),
        });

        // Update project with feedback
        await ProjectModel.findByIdAndUpdate(project._id, {
          aiFeedback: feedback,
        });

        successCount++;
      } catch (error) {
        failCount++;
        errors.push(`${project.name}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated feedback for ${successCount} project(s)${failCount > 0 ? `, ${failCount} failed` : ""}`,
      generated: successCount,
      failed: failCount,
      total: projects.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("POST /api/admin/events/[eventId]/generate-all-feedback error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to generate feedback",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
