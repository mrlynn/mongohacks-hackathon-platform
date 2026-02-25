"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Paper,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";

interface Event {
  _id: string;
  name: string;
  description: string;
  theme: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  location: string;
  isVirtual: boolean;
  tags: string[];
  rules: string;
  judging_criteria: string[];
  status: string;
  capacity: number;
}

export default function EventDetailPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data.event || data);
        }
      } catch (error) {
        console.error("Failed to fetch event:", error);
      } finally {
        setLoading(false);
      }
    }
    if (eventId) fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5">Event not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <Chip
            label={event.status}
            color={
              event.status === "open"
                ? "success"
                : event.status === "in_progress"
                  ? "primary"
                  : "default"
            }
          />
          {event.isVirtual && <Chip label="Virtual" variant="outlined" />}
          <Chip label={event.theme} variant="outlined" color="secondary" />
        </Box>

        <Typography variant="h3" fontWeight={700} gutterBottom>
          {event.name}
        </Typography>

        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CalendarTodayIcon fontSize="small" color="action" />
            <Typography color="text.secondary">
              {new Date(event.startDate).toLocaleDateString()} -{" "}
              {new Date(event.endDate).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <LocationOnIcon fontSize="small" color="action" />
            <Typography color="text.secondary">{event.location}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PeopleIcon fontSize="small" color="action" />
            <Typography color="text.secondary">
              Capacity: {event.capacity}
            </Typography>
          </Box>
        </Box>

        {event.status === "open" && (
          <Button variant="contained" size="large">
            Register Now
          </Button>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" fontWeight={600} gutterBottom>
        About
      </Typography>
      <Typography sx={{ mb: 4, whiteSpace: "pre-wrap" }}>
        {event.description}
      </Typography>

      {event.tags && event.tags.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Tags
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {event.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
          </Box>
        </Box>
      )}

      {event.rules && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Rules
          </Typography>
          <Typography sx={{ whiteSpace: "pre-wrap" }}>{event.rules}</Typography>
        </Paper>
      )}

      {event.judging_criteria && event.judging_criteria.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Judging Criteria
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            {event.judging_criteria.map((criteria, i) => (
              <li key={i}>
                <Typography>{criteria}</Typography>
              </li>
            ))}
          </Box>
        </Box>
      )}

      <Paper sx={{ p: 3, bgcolor: "grey.50" }}>
        <Typography variant="subtitle2" color="text.secondary">
          Registration Deadline
        </Typography>
        <Typography variant="h6">
          {new Date(event.registrationDeadline).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Typography>
      </Paper>
    </Container>
  );
}
