import { auth } from "@/lib/auth";
import { Container, Alert } from "@mui/material";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { ProjectModel } from "@/lib/db/models/Project";
import { ScoreModel } from "@/lib/db/models/Score";
import "@/lib/db/models/Team";
import "@/lib/db/models/User";
import ResultsClient from "./ResultsClient";

const DEFAULT_CRITERIA = [
  { name: "innovation", description: "How novel and creative is the solution?", weight: 1, maxScore: 10 },
  { name: "technical", description: "How sophisticated is the implementation?", weight: 1, maxScore: 10 },
  { name: "impact", description: "How valuable is the solution to users?", weight: 1, maxScore: 10 },
  { name: "presentation", description: "How well is the project documented and demoed?", weight: 1, maxScore: 10 },
];

async function getResults(eventId: string, isAdmin: boolean) {
  try {
    await connectToDatabase();

    const event = await EventModel.findById(eventId).lean();
    if (!event) {
      return { error: "Event not found" };
    }

    // If results not published and user is not admin, hide them
    if (!event.resultsPublished && !isAdmin) {
      return { error: "Results have not been published yet" };
    }

    const rubric =
      event.judgingRubric && event.judgingRubric.length > 0
        ? event.judgingRubric
        : DEFAULT_CRITERIA;

    // Get all submitted/judged projects for this event
    const projects = await ProjectModel.find({
      eventId,
      status: { $in: ["submitted", "under_review", "judged"] },
    })
      .populate("teamId", "name")
      .lean();

    if (projects.length === 0) {
      return {
        success: true,
        results: [],
        rubric: rubric.map((c: any) => ({ name: c.name, weight: c.weight, maxScore: c.maxScore })),
        event: {
          _id: event._id.toString(),
          name: event.name,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          resultsPublished: event.resultsPublished || false,
          resultsPublishedAt: event.resultsPublishedAt,
        },
      };
    }

    // Get all scores for these projects
    const projectIds = projects.map((p) => p._id);
    const scores = await ScoreModel.find({
      projectId: { $in: projectIds },
      eventId,
    })
      .populate("judgeId", "name email")
      .lean();

    // Max possible weighted score
    const maxPossible = rubric.reduce(
      (sum: number, c: any) => sum + c.maxScore * c.weight,
      0
    );

    // Group scores by project and calculate averages dynamically
    const results = [];

    for (const project of projects) {
      const projectScores = scores.filter(
        (s) => s.projectId.toString() === project._id.toString()
      );

      const averageScores: Record<string, number> = {};
      let totalScore = 0;

      if (projectScores.length === 0) {
        for (const c of rubric) {
          averageScores[c.name] = 0;
        }
      } else {
        const judgeCount = projectScores.length;

        for (const c of rubric) {
          const sum = projectScores.reduce(
            (acc, s) => acc + ((s.scores as Record<string, number>)?.[c.name] || 0),
            0
          );
          const avg = parseFloat((sum / judgeCount).toFixed(2));
          averageScores[c.name] = avg;
          totalScore += avg * c.weight;
        }
        totalScore = parseFloat(totalScore.toFixed(2));
      }

      results.push({
        projectId: project._id.toString(),
        rank: 0,
        project: {
          _id: project._id.toString(),
          name: project.name,
          description: project.description,
          repoUrl: project.repoUrl,
          demoUrl: (project as any).demoUrl,
          videoUrl: (project as any).videoUrl,
          technologies: project.technologies,
          aiSummary: (project as any).aiSummary || null,
          aiFeedback: (project as any).aiFeedback || null,
        },
        team: project.teamId
          ? { _id: (project.teamId as any)._id?.toString(), name: (project.teamId as any).name }
          : null,
        averageScores,
        totalScore,
        maxPossible,
        judgeCount: projectScores.length,
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
        results[i].rank = results[i - 1].rank;
      } else {
        results[i].rank = currentRank;
      }
      currentRank++;
    }

    return {
      success: true,
      results: JSON.parse(JSON.stringify(results)),
      rubric: rubric.map((c: any) => ({ name: c.name, weight: c.weight, maxScore: c.maxScore })),
      event: {
        _id: event._id.toString(),
        name: event.name,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        resultsPublished: event.resultsPublished || false,
        resultsPublishedAt: event.resultsPublishedAt,
      },
    };
  } catch (error) {
    console.error("Error fetching results:", error);
    return { error: "Failed to load results" };
  }
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const session = await auth();
  const { eventId } = await params;

  const userRole = session?.user ? (session.user as { role?: string }).role : null;
  const isAdmin = ["admin", "super_admin", "organizer"].includes(userRole || "");

  const data = await getResults(eventId, isAdmin);

  if ("error" in data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">{data.error}</Alert>
      </Container>
    );
  }

  return <ResultsClient {...data} eventId={eventId} isAdmin={isAdmin} />;
}
