import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Container, Alert, Typography, Button, Box } from "@mui/material";
import { ArrowBack as BackIcon } from "@mui/icons-material";
import Link from "next/link";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ eventId: string; projectId: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { eventId, projectId } = await params;

  // TODO: Build full edit form
  // For now, redirect to hub where Quick Edit dialog can be used

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<BackIcon />}
        component={Link}
        href={`/events/${eventId}/projects/${projectId}`}
        sx={{ mb: 3 }}
      >
        Back to Project
      </Button>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Full project editing form coming soon!
        </Typography>
        <Typography variant="body2">
          For now, use the <strong>Quick Edit</strong> feature in the Event Hub to update your project.
        </Typography>
      </Alert>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          component={Link}
          href={`/events/${eventId}/hub`}
        >
          Go to Event Hub (Quick Edit)
        </Button>
        <Button
          variant="outlined"
          component={Link}
          href={`/events/${eventId}/projects/${projectId}`}
        >
          Back to Project
        </Button>
      </Box>
    </Container>
  );
}
