"use client";

import { Box, Typography, Grid, Card, CardContent, Chip } from "@mui/material";
import { Event as EventIcon, People as PeopleIcon, Folder as FolderIcon, Gavel as GavelIcon } from "@mui/icons-material";

interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalProjects: number;
  activeEvents: number;
  judges: number;
  organizers: number;
  participants: number;
  admins: number;
}

export default function AdminDashboardContent({ stats }: { stats: AdminStats }) {
  const statCards = [
    {
      label: "Total Events",
      value: stats.totalEvents,
      subtitle: `${stats.activeEvents} active`,
      icon: <EventIcon sx={{ fontSize: 40 }} />,
      color: "primary.main",
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      subtitle: `${stats.participants} participants`,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: "secondary.main",
    },
    {
      label: "Projects",
      value: stats.totalProjects,
      subtitle: "Submitted",
      icon: <FolderIcon sx={{ fontSize: 40 }} />,
      color: "success.main",
    },
    {
      label: "Judges",
      value: stats.judges,
      subtitle: `${stats.organizers} organizers`,
      icon: <GavelIcon sx={{ fontSize: 40 }} />,
      color: "info.main",
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your hackathon platform from this central console
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid item key={card.label} xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {card.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {card.label}
                </Typography>
                <Chip label={card.subtitle} size="small" variant="outlined" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Quick Actions
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <Chip label="Create Event" color="primary" clickable component="a" href="/admin/events/new" />
            <Chip label="Manage Users" color="secondary" clickable component="a" href="/admin/users" />
            <Chip label="View Projects" color="success" clickable component="a" href="/admin/projects" />
            <Chip label="Assign Judges" color="info" clickable component="a" href="/admin/judges" />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
