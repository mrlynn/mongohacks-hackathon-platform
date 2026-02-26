"use client";

import { useState } from "react";
import {
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
  Alert,
  Snackbar,
  FormControl,
} from "@mui/material";

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

const roleColors: Record<string, "primary" | "secondary" | "success" | "info" | "warning" | "error"> = {
  admin: "error",
  organizer: "primary",
  judge: "info",
  participant: "success",
};

export default function UsersTableClient({ users: initialUsers }: { users: User[] }) {
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
        // Update local state
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

  return (
    <>
      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 500 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
    </>
  );
}
