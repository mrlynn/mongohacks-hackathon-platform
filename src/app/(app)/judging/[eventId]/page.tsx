import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { JudgeAssignmentModel } from "@/lib/db/models/JudgeAssignment";
import { ProjectModel } from "@/lib/db/models/Project";
import { ScoreModel } from "@/lib/db/models/Score";
import { TeamModel } from "@/lib/db/models/Team";
import { UserModel } from "@/lib/db/models/User";
import { serializeDoc, serializeDocs } from "@/lib/utils/serialize";
import JudgingDashboardClient from "./JudgingDashboardClient";
import { Container, Alert } from "@mui/material";

async function getJudgingData(eventId: string, userId: string) {
  await connectToDatabase();

  const event = await EventModel.findById(eventId).lean();
  if (!event) {
    return { error: "Event not found" };
  }

  // Get judge's assignments for this event
  const assignments = await JudgeAssignmentModel.find({
    eventId,
    judgeId: userId,
  })
    .populate({
      path: "projectId",
      select: "name description repoUrl demoUrl videoUrl technologies innovations aiSummary teamId status",
      populate: {
        path: "teamId",
        select: "name members",
      },
    })
    .lean();

  if (assignments.length === 0) {
    return { error: "You have no projects assigned for this event" };
  }

  // Get scores this judge has already submitted
  const scores = await ScoreModel.find({
    eventId,
    judgeId: userId,
  }).lean();

  // Create a map of projectId -> score for quick lookup
  const scoreMap = new Map(scores.map((s) => [s.projectId.toString(), s]));

  // Enhance assignments with score status
  const enhancedAssignments = assignments.map((a: any) => {
    const projectId = a.projectId._id.toString();
    const existingScore = scoreMap.get(projectId);
    
    return {
      ...a,
      hasScore: !!existingScore,
      score: existingScore ? existingScore : null,
    };
  });

  return {
    event: serializeDoc(event),
    assignments: serializeDocs(enhancedAssignments),
  };
}

export default async function JudgingDashboardPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const userRole = (session.user as { role?: string }).role;
  if (!["judge", "admin"].includes(userRole || "")) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Access denied. You must have judge or admin role to access this page.
        </Alert>
      </Container>
    );
  }

  const { eventId } = await params;
  const userId = (session.user as { id: string }).id;
  const data = await getJudgingData(eventId, userId);

  if ("error" in data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">{data.error}</Alert>
      </Container>
    );
  }

  return <JudgingDashboardClient {...data} eventId={eventId} />;
}
