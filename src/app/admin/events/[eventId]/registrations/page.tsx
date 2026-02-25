"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import {
  People as PeopleIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Skills", "Experience", "Registration Date", "Has Team"];
    const rows = registrations.map((reg) => [
      reg.name,
      reg.email,
      reg.skills.join("; "),
      reg.experienceLevel,
      new Date(reg.registrationDate).toLocaleDateString(),
      reg.teamId ? "Yes" : "No",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${eventName.replace(/\s+/g, "-")}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/admin/events")}
          sx={{ mb: 2 }}
        >
          Back to Events
        </Button>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Event Registrations
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {eventName}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportToCSV}
            disabled={registrations.length === 0}
          >
            Export CSV
          </Button>
        </Box>
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

      {registrations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No registrations yet. Share the event landing page to get participants!
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Skills</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Experience</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Registered</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Team Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registrations.map((registration) => (
                <TableRow key={registration._id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{registration.name}</TableCell>
                  <TableCell>{registration.email}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {registration.skills.slice(0, 3).map((skill) => (
                        <Chip key={skill} label={skill} size="small" variant="outlined" />
                      ))}
                      {registration.skills.length > 3 && (
                        <Chip
                          label={`+${registration.skills.length - 3}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={registration.experienceLevel}
                      size="small"
                      color={
                        registration.experienceLevel === "advanced"
                          ? "success"
                          : registration.experienceLevel === "intermediate"
                            ? "primary"
                            : "default"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(registration.registrationDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {registration.teamId ? (
                      <Chip label="On Team" size="small" color="success" />
                    ) : (
                      <Chip label="No Team" size="small" variant="outlined" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
