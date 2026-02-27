import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { ScoreModel } from "@/lib/db/models/Score";
import { ProjectModel } from "@/lib/db/models/Project";
import { EventModel } from "@/lib/db/models/Event";
import { TeamModel } from "@/lib/db/models/Team";
import { notifyScoreReceived } from "@/lib/notifications/notification-service";

// Default criteria when event has no custom rubric
const DEFAULT_CRITERIA = [
  { name: "innovation", description: "How novel and creative is the solution?", weight: 1, maxScore: 10 },
  { name: "technical", description: "How sophisticated is the implementation?", weight: 1, maxScore: 10 },
  { name: "impact", description: "How valuable is the solution to users?", weight: 1, maxScore: 10 },
  { name: "presentation", description: "How well is the project documented and demoed?", weight: 1, maxScore: 10 },
];

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

    const { projectId, scores: submittedScores, comments } = body;

    // Load the event to get its rubric
    const event = await EventModel.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    const rubric =
      event.judgingRubric && event.judgingRubric.length > 0
        ? event.judgingRubric
        : DEFAULT_CRITERIA;

    // Support both old format (flat keys) and new format (scores object)
    // Old format: { projectId, innovation: 5, technical: 7, ... }
    // New format: { projectId, scores: { innovation: 5, technical: 7, ... } }
    let scores: Record<string, number>;
    if (submittedScores && typeof submittedScores === "object") {
      scores = submittedScores;
    } else {
      // Legacy format: extract score keys from body
      scores = {};
      for (const criterion of rubric) {
        const key = criterion.name;
        if (body[key] !== undefined) {
          scores[key] = body[key];
        }
      }
    }

    // Validate scores against rubric criteria
    for (const criterion of rubric) {
      const key = criterion.name;
      const value = scores[key];

      if (value === undefined || value === null) {
        return NextResponse.json(
          {
            success: false,
            message: `Score for "${criterion.name}" is required`,
          },
          { status: 422 }
        );
      }

      if (typeof value !== "number" || value < 1 || value > criterion.maxScore) {
        return NextResponse.json(
          {
            success: false,
            message: `${criterion.name} score must be between 1 and ${criterion.maxScore}`,
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

    // Calculate weighted total
    let totalScore = 0;
    let totalWeight = 0;
    for (const criterion of rubric) {
      totalScore += (scores[criterion.name] || 0) * criterion.weight;
      totalWeight += criterion.weight;
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
          totalScore,
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

    // Fire-and-forget: notify team members of new score
    TeamModel.findById(project.teamId)
      .then((team: any) => {
        if (team) {
          const memberIds = team.members.map((m: any) => m.toString());
          notifyScoreReceived(memberIds, project.name, eventId, projectId);
        }
      })
      .catch(() => {});

    // Calculate max possible score for the response
    const maxPossible = rubric.reduce(
      (sum: number, c: { maxScore: number; weight: number }) => sum + c.maxScore * c.weight,
      0
    );

    return NextResponse.json({
      success: true,
      message: "Score submitted successfully",
      score: {
        _id: score._id.toString(),
        totalScore,
        maxPossible,
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
