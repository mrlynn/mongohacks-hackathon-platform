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
  Card,
  CardContent,
  Typography,
  Grid,
} from "@mui/material";
import {
  Person as PersonIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import ViewToggle from "@/components/shared-ui/ViewToggle";
import ExportButton from "@/components/shared-ui/ExportButton";

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

const experienceLevelColors: Record<string, "success" | "info" | "warning"> = {
  beginner: "success",
  intermediate: "info",
  advanced: "warning",
};

export default function RegistrationsView({ registrations }: { registrations: Registration[] }) {
  const [view, setView] = useState<"table" | "card">("table");

  // CSV export columns
  const csvColumns = [
    { key: "name" as const, label: "Name" },
    { key: "email" as const, label: "Email" },
    { key: "skills" as const, label: "Skills" },
    { key: "experienceLevel" as const, label: "Experience" },
    { key: "registrationDate" as const, label: "Registration Date" },
    { key: "teamId" as const, label: "Has Team" },
  ];

  // Transform data for CSV
  const csvData = registrations.map((reg) => ({
    ...reg,
    skills: reg.skills.join("; "),
    registrationDate: new Date(reg.registrationDate).toLocaleDateString(),
    teamId: reg.teamId ? "Yes" : "No",
  }));

  if (registrations.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          No registrations yet. Share your event to get participants!
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <ViewToggle view={view} onChange={setView} />
        <ExportButton data={csvData} filename="registrations" columns={csvColumns} />
      </Box>

      {/* Table View */}
      {view === "table" && (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Skills</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Experience</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Registered</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Team Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registrations.map((reg) => (
                <TableRow key={reg._id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{reg.name}</TableCell>
                  <TableCell>{reg.email}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {reg.skills.slice(0, 3).map((skill) => (
                        <Chip key={skill} label={skill} size="small" variant="outlined" />
                      ))}
                      {reg.skills.length > 3 && (
                        <Chip label={`+${reg.skills.length - 3}`} size="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={reg.experienceLevel}
                      size="small"
                      color={experienceLevelColors[reg.experienceLevel] || "default"}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(reg.registrationDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {reg.teamId ? (
                      <Chip label="On Team" size="small" color="success" icon={<GroupIcon />} />
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

      {/* Card View */}
      {view === "card" && (
        <Grid container spacing={3}>
          {registrations.map((reg) => (
            <Grid key={reg._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <PersonIcon sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {reg.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {reg.email}
                      </Typography>
                    </Box>
                  </Box>

                  {reg.bio && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {reg.bio.substring(0, 100)}
                      {reg.bio.length > 100 && "..."}
                    </Typography>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                      Skills:
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {reg.skills.map((skill) => (
                        <Chip key={skill} label={skill} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                    <Chip
                      label={reg.experienceLevel}
                      size="small"
                      color={experienceLevelColors[reg.experienceLevel] || "default"}
                    />
                    {reg.teamId ? (
                      <Chip label="On Team" size="small" color="success" icon={<GroupIcon />} />
                    ) : (
                      <Chip label="No Team" size="small" variant="outlined" />
                    )}
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Registered: {new Date(reg.registrationDate).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
