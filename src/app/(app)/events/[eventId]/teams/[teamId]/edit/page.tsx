"use client";

import { Container, Alert, Typography, Button, Box } from "@mui/material";
import { ArrowBack as BackIcon } from "@mui/icons-material";
import { useParams, useRouter } from "next/navigation";

export default function EditTeamPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const teamId = params.teamId as string;

  // TODO: Build full team management interface
  // Features needed:
  // - Update team name/description
  // - Toggle lookingForMembers
  // - Set required/preferred skills
  // - Remove team members (leader only)
  // - Transfer leadership
  // - Disband team

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => router.push(`/events/${eventId}/teams/${teamId}`)}
        sx={{ mb: 3 }}
      >
        Back to Team
      </Button>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Full team management interface coming soon!
        </Typography>
        <Typography variant="body2">
          Features planned:
        </Typography>
        <ul>
          <li>Update team name and description</li>
          <li>Manage team member roster</li>
          <li>Set required and preferred skills</li>
          <li>Toggle "looking for members" status</li>
          <li>Transfer team leadership</li>
        </ul>
      </Alert>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          onClick={() => router.push(`/events/${eventId}/teams/${teamId}`)}
        >
          Back to Team Page
        </Button>
        <Button
          variant="outlined"
          onClick={() => router.push(`/events/${eventId}/hub`)}
        >
          Go to Event Hub
        </Button>
      </Box>
    </Container>
  );
}
