import { Box, Typography, Button, Card, CardContent, Chip, Grid } from "@mui/material";
import { Add as AddIcon, People as PeopleIcon } from "@mui/icons-material";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db/connection";
import { TeamModel } from "@/lib/db/models/Team";
import { EventModel } from "@/lib/db/models/Event";
import { auth } from "@/lib/auth";

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

export default async function TeamsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const session = await auth();
  const [teams, event] = await Promise.all([
    getTeams(eventId),
    getEvent(eventId),
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
          <Grid size={{ xs: 12 }}>
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
            <Grid key={team._id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card elevation={2} sx={{ height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <PeopleIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {team.name}
                    </Typography>
                  </Box>

                  {team.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {team.description}
                    </Typography>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Team Leader
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {team.leaderId?.name || "Unknown"}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Members
                    </Typography>
                    <Typography variant="body2">
                      {team.members.length} / {team.maxMembers}
                    </Typography>
                  </Box>

                  {team.desiredSkills && team.desiredSkills.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
                        Looking for
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {team.desiredSkills.map((skill) => (
                          <Chip key={skill} label={skill} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      component={Link}
                      href={`/events/${eventId}/teams/${team._id}`}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      disabled={team.members.length >= team.maxMembers}
                    >
                      {team.members.length >= team.maxMembers ? "Full" : "Join"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
