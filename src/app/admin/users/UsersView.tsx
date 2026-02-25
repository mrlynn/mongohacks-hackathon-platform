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
  Select,
  MenuItem,
  FormControl,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Typography,
  Grid,
  CardActions,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Person as PersonIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import ViewToggle from "@/components/shared-ui/ViewToggle";
import ExportButton from "@/components/shared-ui/ExportButton";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

const roleColors: Record<
  string,
  "primary" | "secondary" | "success" | "info" | "warning" | "error"
> = {
  admin: "error",
  organizer: "primary",
  judge: "info",
  participant: "success",
};

export default function UsersView({ users: initialUsers }: { users: User[] }) {
  const router = useRouter();
  const [view, setView] = useState<"table" | "card">("table");
  const [users, setUsers] = useState(initialUsers);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
        setSuccess(`Role updated to ${newRole}`);
      } else {
        setError(data.message || "Failed to update role");
      }
    } catch (err) {
      setError("Failed to update role");
    }
  };

  const handleViewAsUser = async (userId: string, userName: string) => {
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`Now viewing as ${userName}`);
        // Redirect to user dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setError(data.error || "Failed to impersonate user");
      }
    } catch (err) {
      setError("Failed to impersonate user");
    }
  };

  // CSV export columns
  const csvColumns = [
    { key: "name" as const, label: "Name" },
    { key: "email" as const, label: "Email" },
    { key: "role" as const, label: "Role" },
    { key: "createdAt" as const, label: "Joined" },
  ];

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <ViewToggle view={view} onChange={setView} />
        <ExportButton data={users} filename="users" columns={csvColumns} />
      </Box>

      {/* Table View */}
      {view === "table" && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <FormControl size="small">
                      <Select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: 120 }}
                      >
                        <MenuItem value="participant">
                          <Chip label="Participant" size="small" color="success" />
                        </MenuItem>
                        <MenuItem value="judge">
                          <Chip label="Judge" size="small" color="info" />
                        </MenuItem>
                        <MenuItem value="organizer">
                          <Chip label="Organizer" size="small" color="primary" />
                        </MenuItem>
                        <MenuItem value="admin">
                          <Chip label="Admin" size="small" color="error" />
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Tooltip title="View site as this user">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewAsUser(user._id, user.name)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
          {users.map((user) => (
            <Grid key={user._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <PersonIcon sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={user.role}
                    size="small"
                    color={roleColors[user.role]}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions sx={{ gap: 1, flexDirection: "column", alignItems: "stretch" }}>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      variant="outlined"
                      size="small"
                    >
                      <MenuItem value="participant">Participant</MenuItem>
                      <MenuItem value="judge">Judge</MenuItem>
                      <MenuItem value="organizer">Organizer</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewAsUser(user._id, user.name)}
                    fullWidth
                  >
                    View As User
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
