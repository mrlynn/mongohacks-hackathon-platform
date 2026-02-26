import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Container, Alert, Typography, Button, Box } from "@mui/material";
import { ArrowBack as BackIcon } from "@mui/icons-material";
import Link from "next/link";

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ eventId: string; teamId: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { eventId, teamId } = await params;

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
        component={Link}
        href={`/events/${eventId}/teams/${teamId}`}
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
          component={Link}
          href={`/events/${eventId}/teams/${teamId}`}
        >
          Back to Team Page
        </Button>
        <Button
          variant="outlined"
          component={Link}
          href={`/events/${eventId}/hub`}
        >
          Go to Event Hub
        </Button>
      </Box>
    </Container>
  );
}
