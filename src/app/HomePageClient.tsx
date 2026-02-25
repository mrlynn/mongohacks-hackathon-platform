"use client";

import { Box, Container, Typography, Button, Grid, Card, CardContent } from "@mui/material";
import {
  Event as EventIcon,
  People as PeopleIcon,
  Folder as FolderIcon,
  Map as MapIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import Link from "next/link";

interface User {
  name?: string;
  email?: string;
  role?: string;
}

export default function HomePageClient({ user }: { user: User | null }) {
  const isAdmin = user?.role === "admin";

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 8,
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          {user ? (
            <>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                Welcome back, {user.name}!
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Ready to continue your hackathon journey?
              </Typography>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  href="/dashboard"
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    "&:hover": { bgcolor: "grey.100" },
                  }}
                >
                  Go to Dashboard
                </Button>
                {isAdmin && (
                  <Button
                    variant="outlined"
                    size="large"
                    component={Link}
                    href="/admin"
                    startIcon={<AdminIcon />}
                    sx={{
                      borderColor: "white",
                      color: "white",
                      "&:hover": {
                        borderColor: "white",
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    Admin Console
                  </Button>
                )}
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                MongoHacks Platform
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Discover, organize, and participate in hackathons around the world
              </Typography>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  href="/register"
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    "&:hover": { bgcolor: "grey.100" },
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  href="/events"
                  sx={{
                    borderColor: "white",
                    color: "white",
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  Browse Events
                </Button>
              </Box>
            </>
          )}
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, textAlign: "center", mb: 6 }}
        >
          Platform Features
        </Typography>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Card elevation={2} sx={{ height: "100%" }}>
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <EventIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Discover Events
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Browse hackathons worldwide with detailed information and registration
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Card elevation={2} sx={{ height: "100%" }}>
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <PeopleIcon sx={{ fontSize: 48, color: "secondary.main", mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Form Teams
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Find teammates with complementary skills and collaborate
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Card elevation={2} sx={{ height: "100%" }}>
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <FolderIcon sx={{ fontSize: 48, color: "success.main", mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Submit Projects
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Showcase your work and get feedback from judges
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Card elevation={2} sx={{ height: "100%" }}>
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <MapIcon sx={{ fontSize: 48, color: "info.main", mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  World Map
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Visualize hackathons globally and find events near you
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Links for Admin */}
        {isAdmin && (
          <Box sx={{ mt: 8, p: 4, bgcolor: "grey.50", borderRadius: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              Admin Quick Links
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  href="/admin/events/new"
                >
                  Create Event
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  href="/admin/users"
                >
                  Manage Users
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  href="/admin/projects"
                >
                  View Projects
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  href="/admin"
                >
                  Admin Dashboard
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
}
