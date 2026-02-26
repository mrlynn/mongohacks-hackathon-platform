"use client";

import { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Web as WebIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  OpenInNew as OpenInNewIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { format } from "date-fns";
import ViewToggle from "@/components/shared-ui/ViewToggle";
import ExportButton from "@/components/shared-ui/ExportButton";

interface Event {
  _id: string;
  name: string;
  theme: string;
  startDate: string;
  endDate: string;
  status: string;
  capacity: number;
  isVirtual: boolean;
  location?: string;
  city?: string;
  country?: string;
  landingPage?: {
    slug?: string;
    published?: boolean;
  };
  partners?: Array<{ _id: string; name: string; tier: string; logo?: string }>;
}

const statusColors: Record<string, "default" | "success" | "info" | "warning" | "error"> = {
  draft: "default",
  open: "success",
  in_progress: "info",
  concluded: "default",
};

export default function EventsView({ events }: { events: Event[] }) {
  const [view, setView] = useState<"table" | "card">("table");

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error deleting event");
    }
  };

  // CSV export columns
  const csvColumns = [
    { key: "name" as const, label: "Event Name" },
    { key: "theme" as const, label: "Theme" },
    { key: "startDate" as const, label: "Start Date" },
    { key: "endDate" as const, label: "End Date" },
    { key: "status" as const, label: "Status" },
    { key: "capacity" as const, label: "Capacity" },
    { key: "isVirtual" as const, label: "Virtual" },
    { key: "location" as const, label: "Location" },
    { key: "city" as const, label: "City" },
    { key: "country" as const, label: "Country" },
  ];

  if (events.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 4, textAlign: "center" }}>
        <Box sx={{ color: "text.secondary" }}>
          No events found. Create your first event to get started.
        </Box>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <ViewToggle view={view} onChange={setView} />
        <ExportButton data={events} filename="events" columns={csvColumns} />
      </Box>

      {/* Table View */}
      {view === "table" && (
        <TableContainer component={Paper} elevation={2} sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Event Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Theme</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Capacity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Partners</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Landing Page</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event._id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{event.name}</TableCell>
                  <TableCell>{event.theme}</TableCell>
                  <TableCell>
                    {format(new Date(event.startDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={event.status}
                      size="small"
                      color={statusColors[event.status]}
                    />
                  </TableCell>
                  <TableCell>{event.capacity}</TableCell>
                  <TableCell>
                    <Chip
                      label={event.isVirtual ? "Virtual" : "In-Person"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {event.partners && event.partners.length > 0 ? (
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {event.partners.slice(0, 3).map((p) => (
                          <Chip
                            key={p._id}
                            label={p.name}
                            size="small"
                            variant="outlined"
                            icon={<BusinessIcon sx={{ fontSize: "14px !important" }} />}
                          />
                        ))}
                        {event.partners.length > 3 && (
                          <Chip
                            label={`+${event.partners.length - 3}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        None
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {event.landingPage?.published ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Chip label="Live" size="small" color="success" />
                        <Tooltip title="View live page">
                          <IconButton
                            size="small"
                            href={`/${event.landingPage.slug}`}
                            target="_blank"
                            sx={{ ml: 0.5 }}
                          >
                            <OpenInNewIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : event.landingPage?.slug ? (
                      <Chip label="Draft" size="small" color="default" />
                    ) : (
                      <Chip label="No Page" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Results">
                      <IconButton
                        size="small"
                       
                        href={`/admin/events/${event._id}/results`}
                        sx={{ color: "warning.main" }}
                      >
                        <TrophyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Registrations">
                      <IconButton
                        size="small"
                       
                        href={`/admin/events/${event._id}/registrations`}
                        color="info"
                      >
                        <PeopleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Landing Page">
                      <IconButton
                        size="small"
                       
                        href={`/admin/events/${event._id}/landing-page`}
                        color="success"
                      >
                        <WebIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                       
                        href={`/events/${event._id}`}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                       
                        href={`/admin/events/${event._id}/edit`}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(event._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Card View */}
      {view === "card" && (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid key={event._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {event.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {event.theme}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                    <Chip
                      label={event.status}
                      size="small"
                      color={statusColors[event.status]}
                    />
                    <Chip
                      label={event.isVirtual ? "Virtual" : "In-Person"}
                      size="small"
                      variant="outlined"
                    />
                    {event.landingPage?.published ? (
                      <Chip label="Live" size="small" color="success" />
                    ) : event.landingPage?.slug ? (
                      <Chip label="Draft" size="small" color="default" />
                    ) : (
                      <Chip label="No Page" size="small" variant="outlined" />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    📅 {format(new Date(event.startDate), "MMM dd, yyyy")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    👥 Capacity: {event.capacity}
                  </Typography>
                  {event.location && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      📍 {event.location}
                    </Typography>
                  )}
                  {event.partners && event.partners.length > 0 && (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
                      {event.partners.map((p) => (
                        <Chip
                          key={p._id}
                          label={p.name}
                          size="small"
                          variant="outlined"
                          icon={<BusinessIcon sx={{ fontSize: "14px !important" }} />}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                  <Box>
                    <Tooltip title="Results">
                      <IconButton
                        size="small"
                       
                        href={`/admin/events/${event._id}/results`}
                        sx={{ color: "warning.main" }}
                      >
                        <TrophyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Registrations">
                      <IconButton
                        size="small"
                       
                        href={`/admin/events/${event._id}/registrations`}
                        color="info"
                      >
                        <PeopleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Landing Page">
                      <IconButton
                        size="small"
                       
                        href={`/admin/events/${event._id}/landing-page`}
                        color="success"
                      >
                        <WebIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View">
                      <IconButton
                        size="small"
                       
                        href={`/events/${event._id}`}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                       
                        href={`/admin/events/${event._id}/edit`}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(event._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
