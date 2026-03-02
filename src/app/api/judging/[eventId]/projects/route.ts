import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { ProjectModel } from "@/lib/db/models/Project";
import { ScoreModel } from "@/lib/db/models/Score";
import { apiLogger } from "@/lib/logger";

export async function GET(
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
        { success: false, error: "Only judges and admins can access this" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { eventId } = await params;
    const userId = (session.user as { id: string }).id;

    // Get all submitted projects for this event
    const projects = await ProjectModel.find({
      eventId,
      status: { $in: ["submitted", "under_review", "judged"] },
    })
      .populate("teamId", "name members")
      .populate("teamMembers", "name email")
      .sort({ submissionDate: -1 })
      .lean();

    // Get judge's scores for these projects
    const projectIds = projects.map((p) => p._id);
    const scores = await ScoreModel.find({
      projectId: { $in: projectIds },
      judgeId: userId,
    }).lean();

    const scoresMap = new Map(
      scores.map((s) => [s.projectId.toString(), s])
    );

    // Combine projects with score status
    interface PopulatedTeam { _id: string; name: string; members?: unknown[] }
    interface PopulatedMember { _id: string; name: string; email: string }

    const projectsWithScores = projects.map((project) => {
      const score = scoresMap.get(project._id.toString());

      return {
        _id: project._id.toString(),
        name: project.name,
        description: project.description,
        category: project.category,
        technologies: project.technologies,
        repoUrl: project.repoUrl,
        demoUrl: project.demoUrl,
        documentationUrl: project.documentationUrl,
        innovations: project.innovations,
        submissionDate: project.submissionDate?.toISOString(),
        status: project.status,
        team: project.teamId
          ? {
              _id: (project.teamId as unknown as PopulatedTeam)._id.toString(),
              name: (project.teamId as unknown as PopulatedTeam).name,
              memberCount: (project.teamId as unknown as PopulatedTeam).members?.length || 0,
            }
          : null,
        teamMembers: project.teamMembers?.map((m: unknown) => {
          const member = m as PopulatedMember;
          return {
            _id: member._id.toString(),
            name: member.name,
            email: member.email,
          };
        }),
        hasScored: !!score,
        myScore: score
          ? {
              _id: score._id.toString(),
              innovation: score.scores.innovation,
              technical: score.scores.technical,
              impact: score.scores.impact,
              presentation: score.scores.presentation,
              totalScore: score.totalScore,
              comments: score.comments,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      projects: projectsWithScores,
    });
  } catch (error) {
    apiLogger.error({ err: error }, "Error fetching projects for judging");
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
