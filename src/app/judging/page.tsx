"use client";

import { Container, Typography } from "@mui/material";

export default function JudgingPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Judging
      </Typography>
      <Typography color="text.secondary">
        The judging interface will be available when events are in the judging
        phase.
      </Typography>
    </Container>
  );
}
