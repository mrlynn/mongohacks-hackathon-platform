import { Box, Typography, Chip } from "@mui/material";
import { connectToDatabase } from "@/lib/db/connection";
import { TeamModel } from "@/lib/db/models/Team";
import { serializeDocs } from "@/lib/utils/serialize";
import TeamsView from "./TeamsView";

async function getTeams() {
  await connectToDatabase();
  const teams = await TeamModel.find()
    .populate("leaderId", "name email")
    .populate("members", "name email")
    .populate("eventId", "name")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const serialized = serializeDocs(teams);

  // Transform to match expected shape
  return serialized.map((team: any) => ({
    _id: team._id,
    name: team.name,
    description: team.description || "",
    event: team.eventId?.name || "Unknown Event",
    eventId: team.eventId?._id || team.eventId || "",
    leader: team.leaderId?.name || "Unknown",
    leaderId: team.leaderId?._id || team.leaderId || "",
    memberCount: team.members?.length || 0,
    members: team.members || [],
    lookingForMembers: team.lookingForMembers || false,
    requiredSkills: team.requiredSkills || [],
    createdAt: team.createdAt || new Date().toISOString(),
  }));
}

export default async function AdminTeamsPage() {
  const teams = await getTeams();

  const stats = {
    total: teams.length,
    lookingForMembers: teams.filter((t) => t.lookingForMembers).length,
    fullTeams: teams.filter((t) => !t.lookingForMembers).length,
    averageSize: teams.length > 0 
      ? Math.round(teams.reduce((sum, t) => sum + t.memberCount, 0) / teams.length) 
      : 0,
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Teams Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all hackathon teams
        </Typography>
      </Box>

      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Chip label={`${stats.total} Total Teams`} />
        <Chip
          label={`${stats.lookingForMembers} Looking for Members`}
          color="warning"
          variant="outlined"
        />
        <Chip
          label={`${stats.fullTeams} Full Teams`}
          color="success"
          variant="outlined"
        />
        <Chip
          label={`Avg ${stats.averageSize} members/team`}
          color="info"
          variant="outlined"
        />
      </Box>

      <TeamsView teams={teams} />
    </Box>
  );
}
