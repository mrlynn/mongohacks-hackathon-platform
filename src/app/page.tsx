"use client";

import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import Link from "next/link";
import GroupsIcon from "@mui/icons-material/Groups";
import CodeIcon from "@mui/icons-material/Code";
import GavelIcon from "@mui/icons-material/Gavel";

export default function HomePage() {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
          color: "white",
          py: 12,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" fontWeight={800} gutterBottom>
            HackPlatform
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Manage hackathons with AI-powered judging, intelligent team
            matching, and comprehensive event management.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              href="/events"
              sx={{
                bgcolor: "white",
                color: "primary.main",
                "&:hover": { bgcolor: "grey.100" },
              }}
            >
              Browse Events
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              href="/register"
              sx={{
                borderColor: "white",
                color: "white",
                "&:hover": {
                  borderColor: "grey.200",
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Get Started
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h4"
          textAlign="center"
          fontWeight={700}
          gutterBottom
        >
          Everything you need to run a hackathon
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: 600, mx: "auto" }}
        >
          From registration to judging, our platform handles the entire
          hackathon lifecycle with intelligent automation.
        </Typography>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: "100%", textAlign: "center", p: 2 }}>
              <CardContent>
                <GroupsIcon
                  sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  Smart Team Matching
                </Typography>
                <Typography color="text.secondary">
                  AI-powered participant matching based on skills, interests,
                  and experience level using vector search.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: "100%", textAlign: "center", p: 2 }}>
              <CardContent>
                <CodeIcon
                  sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  Project Management
                </Typography>
                <Typography color="text.secondary">
                  Submit projects, track progress, and manage team
                  contributions with built-in version tracking.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: "100%", textAlign: "center", p: 2 }}>
              <CardContent>
                <GavelIcon
                  sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  AI-Powered Judging
                </Typography>
                <Typography color="text.secondary">
                  Intelligent project analysis, scoring assistance, and
                  automated award recommendations.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
