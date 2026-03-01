"use client";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  EmojiEvents as PrizeIcon,
  Folder as ProjectIcon,
  Event as EventIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from "@mui/icons-material";
import Link from "next/link";

interface EventData {
  _id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  location: string;
  isVirtual: boolean;
  capacity: number;
  theme: string;
  tags: string[];
}

interface PrizeData {
  _id: string;
  title: string;
  description: string;
  category: string;
  value: string;
  monetaryValue: number;
  isActive: boolean;
  winnersCount: number;
}

const statusColors: Record<string, "success" | "warning" | "info" | "default"> = {
  open: "success",
  in_progress: "warning",
  concluded: "info",
  draft: "default",
};

export default function PartnerEventDetailClient({
  data,
}: {
  data: {
    event: EventData;
    prizes: PrizeData[];
    projectCount: number;
    partnerName: string;
  };
}) {
  const { event, prizes, projectCount, partnerName } = data;

  const startDate = event.startDate
    ? new Date(event.startDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "TBD";
  const endDate = event.endDate
    ? new Date(event.endDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <Box>
      {/* Back button */}
      <Link href="/partner/events">
        <Button startIcon={<BackIcon />} sx={{ mb: 2 }}>
          Back to Events
        </Button>
      </Link>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          {event.name}
        </Typography>
        <Chip
          label={event.status.replace("_", " ")}
          color={statusColors[event.status] || "default"}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Event Info */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Event Details
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {event.description}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Dates
                  </Typography>
                  <Typography variant="body1">
                    {startDate}{endDate ? ` - ${endDate}` : ""}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1">
                    {event.isVirtual ? "Virtual" : event.location || "TBD"}
                  </Typography>
                </Grid>
                {event.theme && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Theme
                    </Typography>
                    <Typography variant="body1">{event.theme}</Typography>
                  </Grid>
                )}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Capacity
                  </Typography>
                  <Typography variant="body1">{event.capacity}</Typography>
                </Grid>
              </Grid>
              {event.tags.length > 0 && (
                <Box sx={{ mt: 2, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {event.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar stats */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <ProjectIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  {projectCount}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Projects Submitted
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <PrizeIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  {prizes.length}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Your Prizes
              </Typography>
            </CardContent>
          </Card>
          <Link href="/partner/prizes">
            <Button variant="contained" fullWidth startIcon={<PrizeIcon />}>
              Manage Prizes
            </Button>
          </Link>
        </Grid>
      </Grid>

      {/* Prizes Table */}
      <Typography variant="h6" fontWeight={600} sx={{ mt: 3, mb: 2 }}>
        Your Prizes for This Event
      </Typography>
      {prizes.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <PrizeIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography color="text.secondary">
              No prizes created for this event yet.
            </Typography>
            <Link href="/partner/prizes">
              <Button sx={{ mt: 2 }} variant="outlined">
                Create a Prize
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Card} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Winners</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prizes.map((prize) => (
                <TableRow key={prize._id}>
                  <TableCell>
                    <Typography fontWeight={500}>{prize.title}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={prize.category} size="small" />
                  </TableCell>
                  <TableCell>{prize.value || "--"}</TableCell>
                  <TableCell>
                    {prize.isActive ? (
                      <Chip icon={<ActiveIcon />} label="Active" size="small" color="success" />
                    ) : (
                      <Chip icon={<InactiveIcon />} label="Inactive" size="small" />
                    )}
                  </TableCell>
                  <TableCell>{prize.winnersCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
