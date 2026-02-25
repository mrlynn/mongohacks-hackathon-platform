import { Box, Typography, Button, Chip } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import EventsTable from "./EventsTable";

async function getEvents() {
  await connectToDatabase();
  const events = await EventModel.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return events.map((event) => ({
    ...event,
    _id: event._id.toString(),
    startDate: event.startDate.toISOString(),
    endDate: event.endDate.toISOString(),
    registrationDeadline: event.registrationDeadline.toISOString(),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  }));
}

export default async function AdminEventsPage() {
  const events = await getEvents();

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
