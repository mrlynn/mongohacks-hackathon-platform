"use client";
import ProjectSuggestionsCTA from "@/components/project-suggestions/ProjectSuggestionsCTA";

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Assignment as ProjectIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import Link from "next/link";

interface EventData {
  _id: string;
  name: string;
  theme: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  isVirtual: boolean;
  status: string;
  registrationDate: string;
  team: {
    _id: string;
    name: string;
    memberCount: number;
    maxMembers: number;
  } | null;
  project: {
    _id: string;
    name: string;
    status: string;
    submissionDate?: string;
  } | null;
}

export default function DashboardClient() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/user/dashboard");
      const data = await res.json();

      if (res.ok) {
        setEvents(data.events || []);
      } else {
        setError(data.error || "Failed to load dashboard");
      }
    } catch (err) {
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "success";
      case "in_progress":
        return "info";
      case "concluded":
        return "default";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: { xs: 2, sm: 4 } }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: "1.75rem", sm: "2.5rem", md: "3rem" } }}>
          My Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your hackathon registrations, teams, and projects
        </Typography>

      <ProjectSuggestionsCTA variant="card" />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {events.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 8, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              You haven't registered for any events yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Browse hackathons and register to get started!
            </Typography>
            <Button variant="contained" href="/events">
              Browse Events
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid key={event._id} size={{ xs: 12 }}>
              <Card elevation={2}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, fontSize: { xs: "1.1rem", sm: "1.5rem" } }}>
                        {event.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {event.theme}
                      </Typography>
                    </Box>
                    <Chip
                      label={event.status.replace("_", " ")}
                      color={getEventStatusColor(event.status) as any}
                      sx={{ height: "fit-content" }}
                    />
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Event Dates
                          </Typography>
                          <Typography variant="body2">
                            {new Date(event.startDate).toLocaleDateString()} -{" "}
                            {new Date(event.endDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Location
                          </Typography>
                          <Typography variant="body2">
                            {event.isVirtual ? "Virtual" : event.location}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Registered
                          </Typography>
                          <Typography variant="body2">
                            {new Date(event.registrationDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Team and Project Status */}
                  <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                    {event.team ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          p: 1.5,
                          bgcolor: "success.50",
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "success.200",
                        }}
                      >
                        <PeopleIcon fontSize="small" color="success" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Team
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {event.team.name} ({event.team.memberCount}/{event.team.maxMembers})
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          p: 1.5,
                          bgcolor: "background.paper",
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "grey.300",
                        }}
                      >
                        <PeopleIcon fontSize="small" color="disabled" />
                        <Typography variant="body2" color="text.secondary">
                          No team yet
                        </Typography>
                      </Box>
                    )}

                    {event.project ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          p: 1.5,
                          bgcolor: "info.50",
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "info.200",
                        }}
                      >
                        <ProjectIcon fontSize="small" color="info" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Project
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {event.project.name}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          p: 1.5,
                          bgcolor: "background.paper",
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "grey.300",
                        }}
                      >
                        <ProjectIcon fontSize="small" color="disabled" />
                        <Typography variant="body2" color="text.secondary">
                          No project submitted
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{ px: { xs: 1.5, sm: 2 }, pb: 2, gap: 1, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    size="small"
                    component={Link}
                    href={`/events/${event._id}/hub`}
                  >
                    Go to Event Hub
                  </Button>

                  {!event.team && (
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<SearchIcon />}
                        component={Link}
                        href={`/events/${event._id}/teams`}
                      >
                        Find Team
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        component={Link}
                        href={`/events/${event._id}/teams/new`}
                      >
                        Create Team
                      </Button>
                    </>
                  )}

                  {event.team && !event.project && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ProjectIcon />}
                      component={Link}
                      href={`/events/${event._id}/projects/new`}
                    >
                      Submit Project
                    </Button>
                  )}

                  {event.project && (
                    <Chip
                      label={`Project ${event.project.status}`}
                      color="success"
                      size="small"
                    />
                  )}

                  <Button
                    variant="text"
                    size="small"
                    component={Link}
                    href={`/events/${event._id}`}
                  >
                    View Event Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
