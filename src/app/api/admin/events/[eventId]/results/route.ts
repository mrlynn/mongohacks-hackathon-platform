import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { ProjectModel } from "@/lib/db/models/Project";
import { ScoreModel } from "@/lib/db/models/Score";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { eventId } = await params;

    // Get all scored projects
    const projects = await ProjectModel.find({
      eventId,
      status: { $in: ["under_review", "judged"] },
    })
      .populate("teamId", "name")
      .populate("teamMembers", "name")
      .lean();

    // Get all scores for this event
    const scores = await ScoreModel.find({ eventId })
      .populate("judgeId", "name email")
      .lean();

    // Group scores by project
    const scoresByProject = new Map<string, any[]>();
    scores.forEach((score) => {
      const projectId = score.projectId.toString();
      if (!scoresByProject.has(projectId)) {
        scoresByProject.set(projectId, []);
      }
      scoresByProject.get(projectId)!.push(score);
    });

    // Calculate average scores for each project
    const results = projects
      .map((project) => {
        const projectScores = scoresByProject.get(project._id.toString()) || [];

        if (projectScores.length === 0) {
          return null; // Skip projects without scores
        }

        const avgInnovation =
          projectScores.reduce((sum, s) => sum + s.scores.innovation, 0) / projectScores.length;
        const avgTechnical =
          projectScores.reduce((sum, s) => sum + s.scores.technical, 0) / projectScores.length;
        const avgImpact =
          projectScores.reduce((sum, s) => sum + s.scores.impact, 0) / projectScores.length;
        const avgPresentation =
          projectScores.reduce((sum, s) => sum + s.scores.presentation, 0) /
          projectScores.length;
        const avgTotal =
          projectScores.reduce((sum, s) => sum + s.totalScore, 0) / projectScores.length;

        return {
          _id: project._id.toString(),
          name: project.name,
          description: project.description,
          category: project.category,
          repoUrl: project.repoUrl,
          demoUrl: project.demoUrl,
          team: project.teamId
            ? {
                _id: (project.teamId as any)._id.toString(),
                name: (project.teamId as any).name,
              }
            : null,
          teamMembers: project.teamMembers?.map((m: any) => ({
            _id: m._id.toString(),
            name: m.name,
          })),
          judgeCount: projectScores.length,
          averageScores: {
            innovation: Number(avgInnovation.toFixed(1)),
            technical: Number(avgTechnical.toFixed(1)),
            impact: Number(avgImpact.toFixed(1)),
            presentation: Number(avgPresentation.toFixed(1)),
            total: Number(avgTotal.toFixed(1)),
          },
          individualScores: projectScores.map((s) => ({
            judge: (s.judgeId as any).name,
            scores: s.scores,
            totalScore: s.totalScore,
            comments: s.comments,
          })),
        };
      })
      .filter((r) => r !== null) // Remove projects without scores
      .sort((a, b) => b!.averageScores.total - a!.averageScores.total); // Sort by total score

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
