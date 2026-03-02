"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import { ErrorOutline, Refresh } from "@mui/icons-material";

export default function EventsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "error.light",
        }}
      >
        <ErrorOutline sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Events Error
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          An error occurred while loading events. Please try again.
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={reset}
          sx={{ mr: 1 }}
        >
          Try Again
        </Button>
        <Button variant="outlined" href="/dashboard">
          Go to Dashboard
        </Button>
      </Paper>
    </Container>
  );
}
