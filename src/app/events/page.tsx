"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";

interface Event {
  _id: string;
  name: string;
  description: string;
  theme: string;
  startDate: string;
  endDate: string;
  location: string;
  isVirtual: boolean;
  tags: string[];
  status: string;
  capacity: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      try {
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        const res = await fetch(`/api/events?${params.toString()}`);
        const data = await res.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [statusFilter]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Hackathon Events
        </Typography>
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="open">Open</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="concluded">Concluded</MenuItem>
        </TextField>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : events.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No events found
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Check back later for upcoming hackathons.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event._id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Chip
                      label={event.status}
                      size="small"
                      color={
                        event.status === "open"
                          ? "success"
                          : event.status === "in_progress"
                            ? "primary"
                            : "default"
                      }
                    />
                    {event.isVirtual && (
                      <Chip label="Virtual" size="small" variant="outlined" />
                    )}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {event.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {event.description}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 1,
                    }}
                  >
                    <CalendarTodayIcon
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(event.startDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <LocationOnIcon
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {event.location}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    component={Link}
                    href={`/events/${event._id}`}
                  >
                    View Details
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
