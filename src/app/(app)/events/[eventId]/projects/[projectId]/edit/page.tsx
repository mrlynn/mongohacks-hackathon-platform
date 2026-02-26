"use client";

import { Container, Alert, Typography, Button, Box } from "@mui/material";
import { ArrowBack as BackIcon } from "@mui/icons-material";
import { useParams, useRouter } from "next/navigation";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const projectId = params.projectId as string;

  // TODO: Build full edit form
  // For now, redirect to hub where Quick Edit dialog can be used

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => router.push(`/events/${eventId}/projects/${projectId}`)}
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
          onClick={() => router.push(`/events/${eventId}/hub`)}
        >
          Go to Event Hub (Quick Edit)
        </Button>
        <Button
          variant="outlined"
          onClick={() => router.push(`/events/${eventId}/projects/${projectId}`)}
        >
          Back to Project
        </Button>
      </Box>
    </Container>
  );
}
