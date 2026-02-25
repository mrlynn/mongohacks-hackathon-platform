"use client";

import { Container, Typography } from "@mui/material";

export default function ProjectsPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Projects
      </Typography>
      <Typography color="text.secondary">
        Project submissions will appear here during active hackathons.
      </Typography>
    </Container>
  );
}
