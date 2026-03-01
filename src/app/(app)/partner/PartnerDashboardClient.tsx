"use client";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Button,
  Avatar,
} from "@mui/material";
import {
  Event as EventIcon,
  EmojiEvents as PrizeIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PartnerDashboardData, PartnerEvent } from "./page";

const tierColors: Record<string, string> = {
  platinum: "#E5E4E2",
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
  community: "#00ED64",
};

const statusColors: Record<string, "success" | "warning" | "info" | "default"> = {
  open: "success",
  in_progress: "warning",
  concluded: "info",
  draft: "default",
};

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: "rgba(0, 237, 100, 0.1)",
            color: "primary.main",
            display: "flex",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function EventCard({ event }: { event: PartnerEvent }) {
  const startDate = event.startDate
    ? new Date(event.startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "TBD";

  return (
    <Card variant="outlined">
      <CardContent>
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
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {startDate} {event.isVirtual ? "(Virtual)" : `- ${event.location}`}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Link href={`/partner/events/${event._id}`} passHref>
            <Button size="small" endIcon={<ArrowForwardIcon />}>
              View Details
            </Button>
          </Link>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function PartnerDashboardClient({
  data,
  isAdmin,
}: {
  data: PartnerDashboardData;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const { partner, events, stats } = data;

  const handleSwitchPartner = async () => {
    await fetch("/api/partner/select", { method: "DELETE" });
    router.refresh();
  };

  return (
    <Box>
      {/* Admin banner */}
      {isAdmin && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, p: 1.5, borderRadius: 1, bgcolor: "action.hover" }}>
          <Typography variant="body2" color="text.secondary">
            Viewing as administrator
          </Typography>
          <Button size="small" variant="outlined" onClick={handleSwitchPartner}>
            Switch Partner
          </Button>
        </Box>
      )}

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Avatar
          src={partner.logo}
          sx={{ width: 56, height: 56, bgcolor: "primary.main" }}
        >
          <BusinessIcon />
        </Avatar>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h4" fontWeight={700}>
              {partner.name}
            </Typography>
            <Chip
              label={partner.tier.charAt(0).toUpperCase() + partner.tier.slice(1)}
              size="small"
              sx={{
                bgcolor: tierColors[partner.tier] || "grey.300",
                color: partner.tier === "platinum" || partner.tier === "silver" ? "black" : "white",
                fontWeight: 600,
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Partner Portal
          </Typography>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Total Events"
            value={stats.totalEvents}
            icon={<EventIcon />}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Active Events"
            value={stats.activeEvents}
            icon={<TrendingUpIcon />}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Prizes Offered"
            value={stats.totalPrizes}
            icon={<PrizeIcon />}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Contribution"
            value={stats.totalContribution > 0 ? `$${stats.totalContribution.toLocaleString()}` : "--"}
            icon={<BusinessIcon />}
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        <Link href="/partner/prizes">
          <Button variant="contained" startIcon={<PrizeIcon />}>
            Manage Prizes
          </Button>
        </Link>
        <Link href="/partner/feedback">
          <Button variant="outlined" startIcon={<EventIcon />}>
            Submit Feedback
          </Button>
        </Link>
        <Link href="/partner/profile">
          <Button variant="outlined" startIcon={<BusinessIcon />}>
            Edit Profile
          </Button>
        </Link>
      </Box>

      {/* Events */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Your Events
      </Typography>
      {events.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <EventIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography color="text.secondary">
              No events assigned yet. Contact an admin to get started.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {events.map((event) => (
            <Grid key={event._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <EventCard event={event} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
