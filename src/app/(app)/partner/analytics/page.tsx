"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from "@mui/material";
import {
  Analytics as AnalyticsIcon,
  Event as EventIcon,
  EmojiEvents as PrizeIcon,
  TrendingUp as TrendingIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";

interface AnalyticsData {
  summary: {
    totalEvents: number;
    activeEvents: number;
    totalPrizes: number;
    activePrizes: number;
    totalPrizeValue: number;
    totalWinners: number;
    tier: string;
  };
  categoryDistribution: Record<string, number>;
  eventStats: Array<{
    _id: string;
    name: string;
    status: string;
    startDate: string;
    capacity: number;
    projectCount: number;
    prizeCount: number;
    prizeValue: number;
  }>;
}

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
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
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
            {subtitle && (
              <Typography variant="caption" color="text.disabled">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function PartnerAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/partner/analytics");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to load analytics");
      }
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return <Alert severity="error">{error || "Failed to load analytics"}</Alert>;
  }

  const { summary, categoryDistribution, eventStats } = data;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AnalyticsIcon color="primary" />
        <Typography variant="h5" fontWeight={700}>
          Analytics
        </Typography>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Total Events" value={summary.totalEvents} icon={<EventIcon />} subtitle={`${summary.activeEvents} active`} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Total Prizes" value={summary.totalPrizes} icon={<PrizeIcon />} subtitle={`${summary.activePrizes} active`} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Prize Value"
            value={summary.totalPrizeValue > 0 ? `$${summary.totalPrizeValue.toLocaleString()}` : "--"}
            icon={<MoneyIcon />}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Winners Awarded" value={summary.totalWinners} icon={<TrendingIcon />} />
        </Grid>
      </Grid>

      {/* Prize Category Distribution */}
      {Object.keys(categoryDistribution).length > 0 && (
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Prize Distribution by Category
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {Object.entries(categoryDistribution).map(([category, count]) => (
                <Chip
                  key={category}
                  label={`${category}: ${count}`}
                  variant="outlined"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Per-Event Stats */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Event Breakdown
      </Typography>
      {eventStats.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">No event data available yet.</Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Card} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Projects</TableCell>
                <TableCell>Your Prizes</TableCell>
                <TableCell>Prize Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eventStats.map((event) => (
                <TableRow key={event._id}>
                  <TableCell>
                    <Typography fontWeight={500}>{event.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={event.status.replace("_", " ")}
                      size="small"
                      color={statusColors[event.status] || "default"}
                    />
                  </TableCell>
                  <TableCell>
                    {event.startDate
                      ? new Date(event.startDate).toLocaleDateString()
                      : "--"}
                  </TableCell>
                  <TableCell>{event.projectCount}</TableCell>
                  <TableCell>{event.prizeCount}</TableCell>
                  <TableCell>
                    {event.prizeValue > 0
                      ? `$${event.prizeValue.toLocaleString()}`
                      : "--"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
