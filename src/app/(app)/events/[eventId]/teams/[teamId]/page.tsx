import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { TeamModel } from "@/lib/db/models/Team";
import { EventModel } from "@/lib/db/models/Event";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { serializeDoc } from "@/lib/utils/serialize";
import TeamDetailClient from "./TeamDetailClient";
import { Container, Alert } from "@mui/material";

async function getTeamData(eventId: string, teamId: string, userId: string) {
  await connectToDatabase();

  const team = await TeamModel.findById(teamId)
    .populate("members", "name email")
    .populate("leaderId", "name email")
    .lean();

  if (!team) {
    return { error: "Team not found" };
  }

  const event = await EventModel.findById(eventId).lean();
  if (!event) {
    return { error: "Event not found" };
  }

  const participant = await ParticipantModel.findOne({
    userId,
    "registeredEvents.eventId": eventId,
  }).lean();

  const isLeader = team.leaderId?._id?.toString() === userId;
  // Check membership - members is an array of User objects after populate
  const isMember = team.members?.some(
    (member: any) => member._id?.toString() === userId
  );

  return {
    team: serializeDoc(team),
    event: serializeDoc(event),
    participant: participant ? serializeDoc(participant) : null,
    isLeader,
    isMember,
  };
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ eventId: string; teamId: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { eventId, teamId } = await params;
  const userId = (session.user as { id: string }).id;
  const data = await getTeamData(eventId, teamId, userId);

  if (data.error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{data.error}</Alert>
      </Container>
    );
  }

  return <TeamDetailClient {...data} eventId={eventId} teamId={teamId} />;
}
