import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { ProjectModel } from "@/lib/db/models/Project";
import { ScoreModel } from "@/lib/db/models/Score";
import { TeamModel } from "@/lib/db/models/Team";

interface AggregateResult {
  projectId: string;
  rank: number;
  project: any;
  team: any;
  averageScores: {
    innovation: number;
    technical: number;
    impact: number;
    presentation: number;
  };
  totalScore: number;
  judgeCount: number;
  scores: any[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await connectToDatabase();
    const { eventId } = await params;

    // Get event
    const event = await EventModel.findById(eventId).lean();
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Get all submitted/judged projects for this event
    const projects = await ProjectModel.find({
      eventId,
      status: { $in: ["submitted", "under_review", "judged"] },
    })
      .populate("teamId", "name")
      .lean();

    if (projects.length === 0) {
      return NextResponse.json({
        success: true,
        results: [],
        event: {
          _id: event._id.toString(),
          name: event.name,
          resultsPublished: event.resultsPublished || false,
        },
      });
    }

    // Get all scores for these projects
    const projectIds = projects.map((p) => p._id);
    const scores = await ScoreModel.find({
      projectId: { $in: projectIds },
      eventId,
    })
      .populate("judgeId", "name email")
      .lean();

    // Group scores by project and calculate averages
    const results: AggregateResult[] = [];

    for (const project of projects) {
      const projectScores = scores.filter(
        (s) => s.projectId.toString() === project._id.toString()
      );

      if (projectScores.length === 0) {
        // Project has no scores yet
        results.push({
          projectId: project._id.toString(),
          rank: 0, // Will be assigned after sorting
          project: {
            _id: project._id.toString(),
            name: project.name,
            description: project.description,
            repoUrl: project.repoUrl,
            demoUrl: project.demoUrl,
            videoUrl: project.videoUrl,
            technologies: project.technologies,
          },
          team: project.teamId,
          averageScores: {
            innovation: 0,
            technical: 0,
            impact: 0,
            presentation: 0,
          },
          totalScore: 0,
          judgeCount: 0,
          scores: [],
        });
        continue;
      }

      // Calculate average for each criterion
      const sumScores = {
        innovation: 0,
        technical: 0,
        impact: 0,
        presentation: 0,
      };

      projectScores.forEach((score) => {
        sumScores.innovation += score.scores.innovation;
        sumScores.technical += score.scores.technical;
        sumScores.impact += score.scores.impact;
        sumScores.presentation += score.scores.presentation;
      });

      const judgeCount = projectScores.length;
      const averageScores = {
        innovation: parseFloat((sumScores.innovation / judgeCount).toFixed(2)),
        technical: parseFloat((sumScores.technical / judgeCount).toFixed(2)),
        impact: parseFloat((sumScores.impact / judgeCount).toFixed(2)),
        presentation: parseFloat((sumScores.presentation / judgeCount).toFixed(2)),
      };

      const totalScore = parseFloat(
        (
          averageScores.innovation +
          averageScores.technical +
          averageScores.impact +
          averageScores.presentation
        ).toFixed(2)
      );

      results.push({
        projectId: project._id.toString(),
        rank: 0, // Will be assigned after sorting
        project: {
          _id: project._id.toString(),
          name: project.name,
          description: project.description,
          repoUrl: project.repoUrl,
          demoUrl: project.demoUrl,
          videoUrl: project.videoUrl,
          technologies: project.technologies,
        },
        team: project.teamId,
        averageScores,
        totalScore,
        judgeCount,
        scores: projectScores.map((s) => ({
          judgeId: s.judgeId,
          scores: s.scores,
          totalScore: s.totalScore,
          comments: s.comments,
          submittedAt: s.submittedAt,
        })),
      });
    }

    // Sort by total score (highest first)
    results.sort((a, b) => b.totalScore - a.totalScore);

    // Assign ranks (handle ties)
    let currentRank = 1;
    for (let i = 0; i < results.length; i++) {
      if (i > 0 && results[i].totalScore === results[i - 1].totalScore) {
        // Tie - same rank as previous
        results[i].rank = results[i - 1].rank;
      } else {
        results[i].rank = currentRank;
      }
      currentRank++;
    }

    return NextResponse.json({
      success: true,
      results,
      event: {
        _id: event._id.toString(),
        name: event.name,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        resultsPublished: event.resultsPublished || false,
        resultsPublishedAt: event.resultsPublishedAt,
      },
    });
  } catch (error) {
    console.error("GET /api/events/[eventId]/results error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
