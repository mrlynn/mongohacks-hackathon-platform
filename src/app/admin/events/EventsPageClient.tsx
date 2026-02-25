"use client";

import { Box, Typography, Button, Chip } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import Link from "next/link";
import EventsTable from "./EventsTable";

interface Event {
  _id: string;
  name: string;
  theme: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  capacity: number;
  isVirtual: boolean;
}

export default function EventsPageClient({ events }: { events: Event[] }) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Events Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage hackathon events
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          href="/admin/events/new"
          sx={{ fontWeight: 600 }}
        >
          Create Event
        </Button>
      </Box>

      <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
        <Chip label={`${events.length} Total Events`} />
        <Chip
          label={`${events.filter((e) => e.status === "open").length} Open`}
          color="success"
          variant="outlined"
        />
        <Chip
          label={`${events.filter((e) => e.status === "in_progress").length} In Progress`}
          color="info"
          variant="outlined"
        />
      </Box>

      <EventsTable events={events} />
    </Box>
  );
}
