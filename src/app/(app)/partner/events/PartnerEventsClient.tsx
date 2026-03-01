"use client";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Button,
} from "@mui/material";
import {
  Event as EventIcon,
  EmojiEvents as PrizeIcon,
  ArrowForward as ArrowForwardIcon,
  LocationOn as LocationIcon,
  Videocam as VirtualIcon,
} from "@mui/icons-material";
import Link from "next/link";
import type { PartnerEventDetail } from "./page";

const statusColors: Record<string, "success" | "warning" | "info" | "default"> = {
  open: "success",
  in_progress: "warning",
  concluded: "info",
  draft: "default",
};

export default function PartnerEventsClient({
  events,
}: {
  events: PartnerEventDetail[];
}) {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <EventIcon color="primary" />
        <Typography variant="h5" fontWeight={700}>
          Your Events
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Events you are participating in as a partner. View details, manage prizes, and track engagement.
      </Typography>

      {events.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <EventIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography color="text.secondary">
              No events assigned yet. Contact an admin to get started.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {events.map((event) => {
            const startDate = event.startDate
              ? new Date(event.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "TBD";
            const endDate = event.endDate
              ? new Date(event.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "";

            return (
              <Grid key={event._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {event.name}
                      </Typography>
                      <Chip
                        label={event.status.replace("_", " ")}
                        size="small"
                        color={statusColors[event.status] || "default"}
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {event.description || "No description"}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                      <EventIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary">
                        {startDate}{endDate ? ` - ${endDate}` : ""}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                      {event.isVirtual ? (
                        <VirtualIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      ) : (
                        <LocationIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {event.isVirtual ? "Virtual" : event.location || "TBD"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2 }}>
                      <PrizeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary">
                        {event.prizeCount} prize{event.prizeCount !== 1 ? "s" : ""} offered
                      </Typography>
                    </Box>

                    <Box sx={{ mt: "auto" }}>
                      <Link href={`/partner/events/${event._id}`} passHref>
                        <Button size="small" endIcon={<ArrowForwardIcon />}>
                          View Details
                        </Button>
                      </Link>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
