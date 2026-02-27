"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import {
  People as PeopleIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import RegistrationsView from "./RegistrationsView";

interface Registration {
  _id: string;
  name: string;
  email: string;
  bio: string;
  skills: string[];
  experienceLevel: string;
  registrationDate: string;
  status: string;
  teamId: string | null;
}

export default function EventRegistrationsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const router = useRouter();
  const [eventId, setEventId] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventName, setEventName] = useState("");

  useEffect(() => {
    params.then((p) => {
      setEventId(p.eventId);
      fetchEvent(p.eventId);
      fetchRegistrations(p.eventId);
    });
  }, []);

  const fetchEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/events/${id}`);
      const data = await res.json();
      if (data.event) {
        setEventName(data.event.name);
      }
    } catch (err) {
      console.error("Failed to fetch event:", err);
    }
  };

  const fetchRegistrations = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/events/${id}/registrations`);
      const data = await res.json();

      if (res.ok) {
        setRegistrations(data.registrations || []);
      } else {
        setError(data.error || "Failed to load registrations");
      }
    } catch (err) {
      setError("Failed to load registrations");
    } finally {
      setLoading(false);
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Event Registrations
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <PeopleIcon sx={{ fontSize: 40, color: "primary.main" }} />
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {registrations.length}
              </Typography>
              <Typography color="text.secondary">Total Registrations</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <RegistrationsView registrations={registrations} />
    </Container>
  );
}
