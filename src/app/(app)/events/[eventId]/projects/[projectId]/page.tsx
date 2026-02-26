import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { ProjectModel } from "@/lib/db/models/Project";
import { TeamModel } from "@/lib/db/models/Team";
import { EventModel } from "@/lib/db/models/Event";
import { serializeDoc } from "@/lib/utils/serialize";
import ProjectDetailClient from "./ProjectDetailClient";
import { Container, Alert } from "@mui/material";

async function getProjectData(eventId: string, projectId: string, userId: string): Promise<{ error: string } | { project: any; team: any; event: any; isTeamMember: boolean; isTeamLeader: boolean }> {
  await connectToDatabase();

  const project = await ProjectModel.findById(projectId).lean();
  if (!project) {
    return { error: "Project not found" };
  }

  const team = await TeamModel.findById(project.teamId)
    .populate("members", "name email")
    .populate("leaderId", "name email")
    .lean();

  const event = await EventModel.findById(eventId).lean();
  if (!event) {
    return { error: "Event not found" };
  }

  // Check membership - members is an array of User objects after populate
  const isTeamMember = !!team?.members?.some(
    (member: any) => member._id?.toString() === userId
  );
  const isTeamLeader = team?.leaderId?._id?.toString() === userId;

  return {
    project: serializeDoc(project),
    team: team ? serializeDoc(team) : null,
    event: serializeDoc(event),
    isTeamMember,
    isTeamLeader: !!isTeamLeader,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ eventId: string; projectId: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { eventId, projectId } = await params;
  const userId = (session.user as { id: string }).id;
  const data = await getProjectData(eventId, projectId, userId);

  if ("error" in data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{data.error}</Alert>
      </Container>
    );
  }

  return <ProjectDetailClient {...data} eventId={eventId} projectId={projectId} />;
}
