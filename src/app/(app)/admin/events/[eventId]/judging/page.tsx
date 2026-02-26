import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { UserModel } from "@/lib/db/models/User";
import { ProjectModel } from "@/lib/db/models/Project";
import { JudgeAssignmentModel } from "@/lib/db/models/JudgeAssignment";
import { serializeDoc, serializeDocs } from "@/lib/utils/serialize";
import JudgingAssignmentClient from "./JudgingAssignmentClient";
import { Container, Alert } from "@mui/material";

async function getJudgingData(eventId: string) {
  await connectToDatabase();

  const event = await EventModel.findById(eventId).lean();
  if (!event) {
    return { error: "Event not found" };
  }

  // Get all judges (users with judge or admin role)
  const judges = await UserModel.find({
    role: { $in: ["judge", "admin"] },
  })
    .select("name email role")
    .lean();

  // Get all submitted projects for this event
  const projects = await ProjectModel.find({
    eventId,
    status: { $in: ["submitted", "under_review", "judged"] },
  })
    .populate("teamId", "name")
    .lean();

  // Get existing assignments
  const assignments = await JudgeAssignmentModel.find({ eventId })
    .populate("judgeId", "name email")
    .populate("projectId", "name")
    .lean();

  return {
    event: serializeDoc(event),
    judges: serializeDocs(judges),
    projects: serializeDocs(projects),
    assignments: serializeDocs(assignments),
  };
}

export default async function JudgingPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const userRole = (session.user as { role?: string }).role;
  if (!["admin", "organizer"].includes(userRole || "")) {
    redirect("/admin");
  }

  const { eventId } = await params;
  const data = await getJudgingData(eventId);

  if ("error" in data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{data.error}</Alert>
      </Container>
    );
  }

  return <JudgingAssignmentClient {...data} eventId={eventId} />;
}
