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
  landingPage?: {
    slug?: string;
    published?: boolean;
  };
}

interface EventStats {
  registered: number;
  capacity: number;
  spotsRemaining: number;
  percentFull: number;
}

export default function EventDetailPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data.event || data);
          setStats(data.stats || null);
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
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
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
        </Box>

        {/* Registration Stats */}
        {stats && (
          <Paper 
            sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: stats.spotsRemaining === 0 ? 'error.50' : stats.percentFull >= 80 ? 'warning.50' : 'success.50',
              border: 1,
              borderColor: stats.spotsRemaining === 0 ? 'error.200' : stats.percentFull >= 80 ? 'warning.200' : 'success.200',
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <PeopleIcon color={stats.spotsRemaining === 0 ? 'error' : stats.percentFull >= 80 ? 'warning' : 'success'} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {stats.spotsRemaining === 0 ? 'Event Full' : `${stats.spotsRemaining} Spot${stats.spotsRemaining !== 1 ? 's' : ''} Remaining`}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {stats.registered} of {stats.capacity} participants registered ({stats.percentFull}% full)
            </Typography>
            <Box sx={{ 
              width: '100%', 
              height: 8, 
              bgcolor: 'background.paper', 
              borderRadius: 1,
              overflow: 'hidden',
            }}>
              <Box sx={{ 
                width: `${stats.percentFull}%`, 
                height: '100%',
                bgcolor: stats.spotsRemaining === 0 ? 'error.main' : stats.percentFull >= 80 ? 'warning.main' : 'success.main',
                transition: 'width 0.3s ease',
              }} />
            </Box>
          </Paper>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {event.landingPage?.slug && event.landingPage.published && (
            <Button
              variant="contained"
              size="large"
              href={`/${event.landingPage.slug}`}
              sx={{
                width: { xs: "100%", sm: "auto" },
                background: "linear-gradient(135deg, #00ED64 0%, #00684A 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #00684A 0%, #023430 100%)",
                },
              }}
            >
              View Event Landing Page
            </Button>
          )}
          {event.status === "open" && (
            <Button
              variant="outlined"
              size="large"
              href={`/events/${eventId}/register`}
              disabled={stats?.spotsRemaining === 0}
              sx={{
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {stats?.spotsRemaining === 0 ? 'Event Full' : 'Register Now'}
            </Button>
          )}
        </Box>
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

      <Paper sx={{ p: 3, bgcolor: "background.paper" }}>
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
