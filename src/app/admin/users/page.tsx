import { Box, Typography, Chip } from "@mui/material";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";
import UsersTableClient from "./UsersTableClient";

async function getUsers() {
  await connectToDatabase();
  const users = await UserModel.find()
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return users.map((user) => ({
    ...user,
    _id: user._id.toString(),
    createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
  }));
}

const roleColors: Record<string, "primary" | "secondary" | "success" | "info" | "warning" | "error"> = {
  admin: "error",
  organizer: "primary",
  judge: "info",
  participant: "success",
};

export default async function AdminUsersPage() {
  const users = await getUsers();

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    organizers: users.filter((u) => u.role === "organizer").length,
    judges: users.filter((u) => u.role === "judge").length,
    participants: users.filter((u) => u.role === "participant").length,
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Users Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage user accounts and roles
        </Typography>
      </Box>

      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Chip label={`${stats.total} Total Users`} />
        <Chip label={`${stats.admins} Admins`} color="error" variant="outlined" />
        <Chip label={`${stats.organizers} Organizers`} color="primary" variant="outlined" />
        <Chip label={`${stats.judges} Judges`} color="info" variant="outlined" />
        <Chip label={`${stats.participants} Participants`} color="success" variant="outlined" />
      </Box>

      <UsersTableClient users={users} />
    </Box>
  );
}
