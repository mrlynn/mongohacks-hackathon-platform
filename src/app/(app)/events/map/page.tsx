"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Chip, CircularProgress, Alert, Card, CardContent } from "@mui/material";
import dynamic from 'next/dynamic';

// Lazy load EventsMap to avoid SSR issues with Leaflet
const EventsMap = dynamic(() => import('@/components/shared-ui/EventsMap'), {
  ssr: false,
  loading: () => <CircularProgress />,
});

interface Event {
  _id: string;
  name: string;
  city?: string;
  country?: string;
  coordinates: [number, number];
  venue?: string;
  startDate: string;
  endDate: string;
  isVirtual: boolean;
  status: string;
}

export default function EventsMapPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    virtual: 0,
    inPerson: 0,
    countries: 0,
  });

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/events/map?status=all");
        const data = await response.json();

        if (data.success) {
          setEvents(data.events);

          // Calculate stats
          const countries = new Set(data.events.map((e: Event) => e.country));
          setStats({
            total: data.events.length,
            virtual: data.events.filter((e: Event) => e.isVirtual).length,
            inPerson: data.events.filter((e: Event) => !e.isVirtual).length,
            countries: countries.size,
          });
        } else {
          setError(data.error || "Failed to load events");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load events map");
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          MongoDB Hackathons World Map
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover hackathons happening around the world
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Chip label={`${stats.total} Total Events`} color="primary" />
        <Chip label={`${stats.countries} Countries`} variant="outlined" />
        <Chip label={`${stats.inPerson} In-Person`} variant="outlined" />
        <Chip label={`${stats.virtual} Virtual`} variant="outlined" />
      </Box>

      {loading ? (
        <Card elevation={2}>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <CircularProgress sx={{ color: "primary.main" }} />
            <Typography sx={{ mt: 2 }} color="text.secondary">
              Loading hackathon map...
            </Typography>
          </CardContent>
        </Card>
      ) : events.length === 0 ? (
        <Card elevation={2}>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="body1" color="text.secondary">
              No events with location data yet. Create your first event with coordinates!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card elevation={2}>
          <CardContent sx={{ p: 0 }}>
            <EventsMap events={events} />
          </CardContent>
        </Card>
      )}

      <Box sx={{ mt: 3 }}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Map Legend
            </Typography>
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                  }}
                />
                <Typography variant="body2">MongoDB Green: Event Location</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip label="Virtual" size="small" color="secondary" />
                <Typography variant="body2">Online Events</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
