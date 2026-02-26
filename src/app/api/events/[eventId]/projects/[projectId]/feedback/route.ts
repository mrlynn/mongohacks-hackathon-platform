import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { ProjectModel } from "@/lib/db/models/Project";
import { ScoreModel } from "@/lib/db/models/Score";
import { TeamModel } from "@/lib/db/models/Team";
import { synthesizeJudgeFeedback } from "@/lib/ai/feedback-service";

/**
 * GET  — returns existing aiFeedback (or 404 if not yet generated)
 * POST — (re)generates and stores aiFeedback; restricted to team members + admins
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string; projectId: string }> }
) {
  try {
    await connectToDatabase();
    const { projectId } = await params;

    const project = await ProjectModel.findById(projectId).select(
      "name status aiFeedback"
    );
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      aiFeedback: project.aiFeedback || null,
      status: project.status,
    });
  } catch (error) {
    console.error("GET feedback error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string; projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { eventId, projectId } = await params;
    const userId = (session.user as { id: string }).id;
    const userRole = (session.user as { role?: string }).role;
    const realAdminRole = (session.user as { realAdminRole?: string }).realAdminRole;
    const isImpersonating = (session.user as { isImpersonating?: boolean }).isImpersonating;
    const effectiveRole = isImpersonating ? realAdminRole : userRole;

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    // Only team members and admins can request feedback generation
    if (effectiveRole !== "admin" && effectiveRole !== "organizer") {
      const team = await TeamModel.findOne({ _id: project.teamId, eventId });
      const isMember = team?.members.some((m: any) => m.toString() === userId);
      if (!isMember) {
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 }
        );
      }
    }

    // Gather all judge scores for this project
    const scores = await ScoreModel.find({ projectId }).lean();
    if (scores.length === 0) {
      return NextResponse.json(
        { success: false, error: "No judge scores found for this project" },
        { status: 422 }
      );
    }

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

    project.aiFeedback = feedback;
    await project.save();

    return NextResponse.json({ success: true, aiFeedback: feedback });
  } catch (error) {
    console.error("POST feedback error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}
