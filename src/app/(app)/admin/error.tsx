"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Box, Typography, Button, Paper } from "@mui/material";
import { ErrorOutline, Refresh, ArrowBack } from "@mui/icons-material";

export default function AdminError({
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
    <Box sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
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
          Admin Panel Error
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Something went wrong loading this admin page.
        </Typography>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
          <Button variant="contained" startIcon={<Refresh />} onClick={reset}>
            Try Again
          </Button>
          <Button variant="outlined" startIcon={<ArrowBack />} href="/admin">
            Back to Admin
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
