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
  Button,
  CardActions,
} from "@mui/material";
import {
  Gavel as GavelIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import ViewToggle from "@/components/shared-ui/ViewToggle";
import ExportButton from "@/components/shared-ui/ExportButton";

interface Judge {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function JudgesView({ judges }: { judges: Judge[] }) {
  const [view, setView] = useState<"table" | "card">("table");

  // CSV export columns
  const csvColumns = [
    { key: "name" as const, label: "Name" },
    { key: "email" as const, label: "Email" },
    { key: "createdAt" as const, label: "Joined" },
  ];

  // Transform data for CSV
  const csvData = judges.map((judge) => ({
    ...judge,
    createdAt: new Date(judge.createdAt).toLocaleDateString(),
  }));

  if (judges.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          No judges assigned yet. Promote users to judge role from the Users Management page.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <ViewToggle view={view} onChange={setView} />
        <ExportButton data={csvData} filename="judges" columns={csvColumns} />
      </Box>

      {/* Table View */}
      {view === "table" && (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Assigned Projects</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {judges.map((judge) => (
                <TableRow key={judge._id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{judge.name}</TableCell>
                  <TableCell>{judge.email}</TableCell>
                  <TableCell>{new Date(judge.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip label="0 projects" size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="outlined">
                      Manage Assignments
                    </Button>
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
          {judges.map((judge) => (
            <Grid key={judge._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <GavelIcon sx={{ fontSize: 40, color: "info.main", mr: 2 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {judge.name}
                      </Typography>
                      <Chip label="Judge" size="small" color="info" sx={{ mt: 0.5 }} />
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {judge.email}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Chip label="0 projects assigned" size="small" variant="outlined" />
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Joined: {new Date(judge.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" variant="outlined" fullWidth>
                    Manage Assignments
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
