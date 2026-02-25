import { Box, Typography, Button, Card, CardContent, Chip, Grid } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db/connection";
import { TeamModel } from "@/lib/db/models/Team";
import { EventModel } from "@/lib/db/models/Event";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { auth } from "@/lib/auth";
import TeamCard from "./TeamCard";

async function getTeams(eventId: string) {
  await connectToDatabase();
  const teams = await TeamModel.find({ eventId, lookingForMembers: true })
    .populate("members", "name email")
    .populate("leaderId", "name email")
    .lean();

  return teams.map((team) => ({
    ...team,
    _id: team._id.toString(),
    eventId: team.eventId.toString(),
    members: team.members.map((m: any) => ({
      ...m,
      _id: m._id.toString(),
    })),
    leaderId: team.leaderId ? {
      ...(team.leaderId as any),
      _id: (team.leaderId as any)._id.toString(),
    } : null,
    createdAt: team.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: team.updatedAt?.toISOString() || new Date().toISOString(),
  }));
}

async function getEvent(eventId: string) {
  await connectToDatabase();
  const event = await EventModel.findById(eventId).lean();
  if (!event) return null;

  return {
    ...event,
    _id: event._id.toString(),
    startDate: event.startDate?.toISOString() || new Date().toISOString(),
    endDate: event.endDate?.toISOString() || new Date().toISOString(),
    registrationDeadline: event.registrationDeadline?.toISOString() || new Date().toISOString(),
  };
}

async function getUserTeamId(userId: string | undefined, eventId: string): Promise<string | null> {
  if (!userId) return null;
  
  await connectToDatabase();
  const participant = await ParticipantModel.findOne({
    userId,
    "registeredEvents.eventId": eventId,
  }).lean();
  
  return participant?.teamId?.toString() || null;
}

export default async function TeamsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  
  const [teams, event, userTeamId] = await Promise.all([
    getTeams(eventId),
    getEvent(eventId),
    getUserTeamId(userId, eventId),
  ]);

  if (!event) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Event not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Teams - {event.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Find a team or create your own
          </Typography>
        </Box>
        {session?.user && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            href={`/events/${eventId}/teams/new`}
          >
            Create Team
          </Button>
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Chip label={`${teams.length} Teams Looking for Members`} color="primary" />
      </Box>

      <Grid container spacing={3}>
        {teams.length === 0 ? (
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  No teams looking for members yet. Be the first to create one!
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  component={Link}
                  href={`/events/${eventId}/teams/new`}
                >
                  Create Team
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          teams.map((team) => (
            <Grid item key={team._id} xs={12} md={6} lg={4}>
              <TeamCard
                team={team as any}
                eventId={eventId}
                userId={userId || null}
                userTeamId={userTeamId}
              />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
