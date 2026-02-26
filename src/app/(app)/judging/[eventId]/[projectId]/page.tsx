import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { JudgeAssignmentModel } from "@/lib/db/models/JudgeAssignment";
import { ProjectModel } from "@/lib/db/models/Project";
import { ScoreModel } from "@/lib/db/models/Score";
import { TeamModel } from "@/lib/db/models/Team";
import { UserModel } from "@/lib/db/models/User";
import { serializeDoc } from "@/lib/utils/serialize";
import ProjectScoringClient from "./ProjectScoringClient";
import { Container, Alert } from "@mui/material";

async function getScoringData(eventId: string, projectId: string, userId: string) {
  await connectToDatabase();

  const event = await EventModel.findById(eventId).lean();
  if (!event) {
    return { error: "Event not found" };
  }

  // Verify judge is assigned to this project
  const assignment = await JudgeAssignmentModel.findOne({
    eventId,
    projectId,
    judgeId: userId,
  }).lean();

  if (!assignment) {
    return { error: "You are not assigned to judge this project" };
  }

  // Get project with team info
  const project = await ProjectModel.findById(projectId)
    .populate({
      path: "teamId",
      populate: {
        path: "members",
        select: "name email",
      },
    })
    .lean();

  if (!project) {
    return { error: "Project not found" };
  }

  // Get existing score if any
  const existingScore = await ScoreModel.findOne({
    projectId,
    judgeId: userId,
  }).lean();

  return {
    event: serializeDoc(event),
    project: serializeDoc(project),
    existingScore: existingScore ? serializeDoc(existingScore) : null,
    assignment: serializeDoc(assignment),
  };
}

export default async function ProjectScoringPage({
  params,
}: {
  params: Promise<{ eventId: string; projectId: string }>;
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

  const { eventId, projectId } = await params;
  const userId = (session.user as { id: string }).id;
  const data = await getScoringData(eventId, projectId, userId);

  if ("error" in data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{data.error}</Alert>
      </Container>
    );
  }

  return <ProjectScoringClient {...data} eventId={eventId} projectId={projectId} />;
}
