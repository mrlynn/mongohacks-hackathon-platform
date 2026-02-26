"use client";

import {
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
  Box,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Web as WebIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  CardGiftcard as PrizesIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { format } from "date-fns";

interface Event {
  _id: string;
  name: string;
  theme: string;
  startDate: string;
  endDate: string;
  status: string;
  capacity: number;
  isVirtual: boolean;
}

const statusColors: Record<string, "default" | "success" | "info" | "warning" | "error"> = {
  draft: "default",
  open: "success",
  in_progress: "info",
  concluded: "default",
};

export default function EventsTable({ events }: { events: Event[] }) {
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
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Event Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Theme</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Capacity</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
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
                  label={event.status.replace("_", " ")}
                  size="small"
                  color={statusColors[event.status] || "default"}
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
              <TableCell align="right">
                <Tooltip title="Prizes">
                  <IconButton
                    size="small"

                    href={`/admin/events/${event._id}/prizes`}
                    sx={{ color: "secondary.main" }}
                  >
                    <PrizesIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
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
  );
}
