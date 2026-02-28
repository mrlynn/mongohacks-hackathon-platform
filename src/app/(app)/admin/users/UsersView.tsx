"use client";

import { useState, useMemo } from "react";
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
  TextField,
  InputAdornment,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import {
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  SearchOutlined,
  PersonAddOutlined,
  EditOutlined,
  EmailOutlined,
  LockOutlined,
  BadgeOutlined,
  AdminPanelSettingsOutlined,
  CloseOutlined,
  Block as BlockIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import ViewToggle from "@/components/shared-ui/ViewToggle";
import ExportButton from "@/components/shared-ui/ExportButton";
import {
  FilterToolbar,
  MultiSelectFilter,
  DateRangeFilter,
  useFilterState,
} from "@/components/shared-ui/filters";
import { useRouter } from "next/navigation";
import { mongoColors } from "@/styles/theme";

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
  super_admin: "warning",
  admin: "error",
  organizer: "primary",
  marketer: "secondary",
  mentor: "info",
  judge: "info",
  participant: "success",
};

const DEFAULT_FILTERS = {
  search: "",
  status: "",
  roles: [] as string[],
  joinedFrom: "",
  joinedTo: "",
  sortField: "createdAt",
  sortDirection: "desc" as "asc" | "desc",
};


// ─── Add User Dialog ────────────────────────────────────────────────

function AddUserDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "participant" as string,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess(data.user);
        setForm({ name: "", email: "", password: "", role: "participant" });
      } else {
        setError(data.error || "Failed to create user");
      }
    } catch {
      setError("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ name: "", email: "", password: "", role: "participant" });
    setError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "visible",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            borderRadius: "12px 12px 0 0",
            background: `linear-gradient(90deg, ${mongoColors.green.main}, ${mongoColors.green.dark})`,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          pt: 3,
          fontWeight: 700,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(135deg, ${mongoColors.green.main}18, ${mongoColors.green.main}08)`,
            color: mongoColors.green.main,
          }}
        >
          <PersonAddOutlined />
        </Box>
        Add New User
        <IconButton
          onClick={handleClose}
          sx={{ ml: "auto" }}
          size="small"
        >
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2, pb: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
          <TextField
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
            required
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            label="Email Address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            fullWidth
            required
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            fullWidth
            required
            helperText="Minimum 8 characters"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={form.role}
              label="Role"
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              startAdornment={
                <InputAdornment position="start">
                  <AdminPanelSettingsOutlined
                    sx={{ color: "text.secondary", fontSize: 20 }}
                  />
                </InputAdornment>
              }
            >
              <MenuItem value="participant">
                <Chip label="Participant" size="small" color="success" sx={{ mr: 1 }} />
                Participant
              </MenuItem>
              <MenuItem value="mentor">
                <Chip label="Mentor" size="small" color="info" sx={{ mr: 1 }} />
                Mentor
              </MenuItem>
              <MenuItem value="judge">
                <Chip label="Judge" size="small" color="info" sx={{ mr: 1 }} />
                Judge
              </MenuItem>
              <MenuItem value="organizer">
                <Chip label="Organizer" size="small" color="primary" sx={{ mr: 1 }} />
                Organizer
              </MenuItem>
              <MenuItem value="marketer">
                <Chip label="Marketer" size="small" color="secondary" sx={{ mr: 1 }} />
                Marketer
              </MenuItem>
              <MenuItem value="admin">
                <Chip label="Admin" size="small" color="error" sx={{ mr: 1 }} />
                Admin
              </MenuItem>
              <MenuItem value="super_admin">
                <Chip label="Super Admin" size="small" color="warning" sx={{ mr: 1 }} />
                Super Admin
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button onClick={handleClose} variant="outlined" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={18} color="inherit" /> : <PersonAddOutlined />
          }
        >
          {loading ? "Creating..." : "Create User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Edit User Dialog ───────────────────────────────────────────────

function EditUserDialog({
  open,
  user,
  onClose,
  onSuccess,
}: {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: (user: User) => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync form when user changes
  const [prevUserId, setPrevUserId] = useState<string | null>(null);
  if (user && user._id !== prevUserId) {
    setForm({ name: user.name, email: user.email, role: user.role });
    setPrevUserId(user._id);
    setError("");
  }

  const handleSubmit = async () => {
    if (!user) return;
    setError("");
    if (!form.name || !form.email) {
      setError("Name and email are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess(data.user);
      } else {
        setError(data.error || "Failed to update user");
      }
    } catch {
      setError("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPrevUserId(null);
    setError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "visible",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            borderRadius: "12px 12px 0 0",
            background: `linear-gradient(90deg, ${mongoColors.blue.main}, ${mongoColors.purple.main})`,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          pt: 3,
          fontWeight: 700,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(135deg, ${mongoColors.blue.main}18, ${mongoColors.blue.main}08)`,
            color: mongoColors.blue.main,
          }}
        >
          <EditOutlined />
        </Box>
        Edit User
        <IconButton
          onClick={handleClose}
          sx={{ ml: "auto" }}
          size="small"
        >
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2, pb: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
          <TextField
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
            required
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            label="Email Address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            fullWidth
            required
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={form.role}
              label="Role"
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              startAdornment={
                <InputAdornment position="start">
                  <AdminPanelSettingsOutlined
                    sx={{ color: "text.secondary", fontSize: 20 }}
                  />
                </InputAdornment>
              }
            >
              <MenuItem value="participant">
                <Chip label="Participant" size="small" color="success" sx={{ mr: 1 }} />
                Participant
              </MenuItem>
              <MenuItem value="mentor">
                <Chip label="Mentor" size="small" color="info" sx={{ mr: 1 }} />
                Mentor
              </MenuItem>
              <MenuItem value="judge">
                <Chip label="Judge" size="small" color="info" sx={{ mr: 1 }} />
                Judge
              </MenuItem>
              <MenuItem value="organizer">
                <Chip label="Organizer" size="small" color="primary" sx={{ mr: 1 }} />
                Organizer
              </MenuItem>
              <MenuItem value="marketer">
                <Chip label="Marketer" size="small" color="secondary" sx={{ mr: 1 }} />
                Marketer
              </MenuItem>
              <MenuItem value="admin">
                <Chip label="Admin" size="small" color="error" sx={{ mr: 1 }} />
                Admin
              </MenuItem>
              <MenuItem value="super_admin">
                <Chip label="Super Admin" size="small" color="warning" sx={{ mr: 1 }} />
                Super Admin
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button onClick={handleClose} variant="outlined" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={18} color="inherit" /> : <EditOutlined />
          }
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main UsersView ─────────────────────────────────────────────────

export default function UsersView({ users: initialUsers }: { users: User[] }) {
  const router = useRouter();
  const [view, setView] = useState<"table" | "card">("table");
  const [users, setUsers] = useState(initialUsers);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const {
    filters,
    updateFilter,
    clearFilters,
    activeFilters,
  } = useFilterState(DEFAULT_FILTERS);

  // Apply filters and search
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    // Search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower) ||
          u.role.toLowerCase().includes(searchLower)
      );
    }

    // Role filter
    if (filters.roles.length > 0) {
      result = result.filter((u) => filters.roles.includes(u.role));
    }

    // Join date range
    if (filters.joinedFrom) {
      result = result.filter((u) => new Date(u.createdAt) >= new Date(filters.joinedFrom));
    }
    if (filters.joinedTo) {
      result = result.filter((u) => new Date(u.createdAt) <= new Date(filters.joinedTo));
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (filters.sortField) {
        case "name":
          aVal = a.name;
          bVal = b.name;
          break;
        case "email":
          aVal = a.email;
          bVal = b.email;
          break;
        case "role":
          aVal = a.role;
          bVal = b.role;
          break;
        case "createdAt":
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return filters.sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return filters.sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, filters]);

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
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.error || "Failed to impersonate user");
      }
    } catch (err) {
      setError("Failed to impersonate user");
    }
  };

  const handleAddSuccess = (user: User) => {
    setUsers((prev) => [user, ...prev]);
    setAddOpen(false);
    setSuccess(`User "${user.name}" created successfully`);
  };

  const handleEditSuccess = (updated: User) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === updated._id ? updated : u))
    );
    setEditUser(null);
    setSuccess(`User "${updated.name}" updated successfully`);
  };

  const handleBanUser = async (userId: string, currentlyBanned: boolean) => {
    if (!confirm(currentlyBanned ? "Unban this user?" : "Ban this user? They will not be able to log in.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: currentlyBanned ? undefined : "Banned by administrator",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId
              ? { ...u, banned: data.user.banned, bannedAt: data.user.bannedAt, bannedReason: data.user.bannedReason }
              : u
          )
        );
        setSuccess(currentlyBanned ? "User unbanned successfully" : "User banned successfully");
      } else {
        setError(data.error || "Failed to update ban status");
      }
    } catch (err) {
      setError("Failed to update ban status");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        setSuccess("User deleted successfully");
      } else {
        setError(data.error || "Failed to delete user");
      }
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  const csvColumns = [
    { key: "name" as const, label: "Name" },
    { key: "email" as const, label: "Email" },
    { key: "role" as const, label: "Role" },
    { key: "createdAt" as const, label: "Joined" },
  ];

  return (
    <Box>
      {/* Filter Toolbar */}
      <FilterToolbar
        searchValue={filters.search}
        onSearchChange={(value) => updateFilter("search", value)}
        searchPlaceholder="Search users by name, email, role..."
        sortField={filters.sortField}
        sortDirection={filters.sortDirection}
        onSortFieldChange={(field) => updateFilter("sortField", field)}
        onSortDirectionChange={(dir) => updateFilter("sortDirection", dir)}
        sortOptions={[
          { value: "name", label: "Name" },
          { value: "email", label: "Email" },
          { value: "role", label: "Role" },
          { value: "createdAt", label: "Joined" },
        ]}
        activeFilters={activeFilters}
        onRemoveFilter={(key) => updateFilter(key as any, DEFAULT_FILTERS[key as keyof typeof DEFAULT_FILTERS])}
        onClearAllFilters={clearFilters}
        rightActions={
          <>
            <Button
              variant="contained"
              startIcon={<PersonAddOutlined />}
              onClick={() => setAddOpen(true)}
              size="small"
            >
              Add User
            </Button>
            <ViewToggle view={view} onChange={setView} />
            <ExportButton data={filteredAndSortedUsers} filename="users" columns={csvColumns} />
          </>
        }
      >
        {/* Filter Groups */}
        <MultiSelectFilter
          label="Role"
          options={[
            { value: "participant", label: "Participant" },
            { value: "mentor", label: "Mentor" },
            { value: "judge", label: "Judge" },
            { value: "organizer", label: "Organizer" },
            { value: "marketer", label: "Marketer" },
            { value: "admin", label: "Admin" },
            { value: "super_admin", label: "Super Admin" },
          ]}
          selected={filters.roles}
          onChange={(value) => updateFilter("roles", value)}
        />

        <DateRangeFilter
          label="Join Date"
          startDate={filters.joinedFrom}
          endDate={filters.joinedTo}
          onStartDateChange={(date) => updateFilter("joinedFrom", date)}
          onEndDateChange={(date) => updateFilter("joinedTo", date)}
        />
      </FilterToolbar>

      {/* Results count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredAndSortedUsers.length} of {users.length} users
      </Typography>

      {/* Empty state */}
      {filteredAndSortedUsers.length === 0 && (
        <Paper elevation={2} sx={{ p: 4, textAlign: "center" }}>
          <Box sx={{ color: "text.secondary" }}>
            {filters.search || activeFilters.length > 0
              ? "No users match your filters. Try adjusting your search criteria."
              : "No users found. Create your first user to get started."}
          </Box>
        </Paper>
      )}

      {/* Table View */}
      {view === "table" && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow
                sx={{ bgcolor: `${mongoColors.green.main}08` }}
              >
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedUsers.map((user) => (
                <TableRow
                  key={user._id}
                  hover
                  sx={{
                    "&:hover": {
                      borderLeft: `3px solid ${mongoColors.green.main}`,
                    },
                    borderLeft: "3px solid transparent",
                    transition: "border-color 0.2s ease",
                  }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <FormControl size="small">
                      <Select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value)
                        }
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: 120 }}
                      >
                        <MenuItem value="participant">
                          <Chip label="Participant" size="small" color="success" />
                        </MenuItem>
                        <MenuItem value="mentor">
                          <Chip label="Mentor" size="small" color="info" />
                        </MenuItem>
                        <MenuItem value="judge">
                          <Chip label="Judge" size="small" color="info" />
                        </MenuItem>
                        <MenuItem value="organizer">
                          <Chip label="Organizer" size="small" color="primary" />
                        </MenuItem>
                        <MenuItem value="marketer">
                          <Chip label="Marketer" size="small" color="secondary" />
                        </MenuItem>
                        <MenuItem value="admin">
                          <Chip label="Admin" size="small" color="error" />
                        </MenuItem>
                        <MenuItem value="super_admin">
                          <Chip label="Super Admin" size="small" color="warning" />
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="Edit user">
                        <IconButton
                          size="small"
                          onClick={() => setEditUser(user)}
                          sx={{
                            color: mongoColors.slate.light,
                            "&:hover": {
                              bgcolor: `${mongoColors.blue.main}0D`,
                              color: mongoColors.blue.main,
                            },
                          }}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View site as this user">
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleViewAsUser(user._id, user.name)
                          }
                          sx={{
                            color: mongoColors.slate.light,
                            "&:hover": {
                              bgcolor: `${mongoColors.green.main}0D`,
                              color: mongoColors.green.main,
                            },
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={(user as any).banned ? "Unban user" : "Ban user"}>
                        <IconButton
                          size="small"
                          onClick={() => handleBanUser(user._id, (user as any).banned)}
                          disabled={user.role === "super_admin"}
                          sx={{
                            color: (user as any).banned ? "#FF9800" : mongoColors.slate.light,
                            "&:hover": {
                              bgcolor: `${"#FF9800"}0D`,
                              color: "#FF9800",
                            },
                          }}
                        >
                          <BlockIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete user">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={user.role === "super_admin"}
                          sx={{
                            color: mongoColors.slate.light,
                            "&:hover": {
                              bgcolor: `${"#F44336"}0D`,
                              color: "#F44336",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
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
          {filteredAndSortedUsers.map((user) => (
            <Grid key={user._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  position: "relative",
                  overflow: "visible",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 24,
                    right: 24,
                    height: 3,
                    borderRadius: "0 0 3px 3px",
                    background: `linear-gradient(90deg, ${mongoColors.green.main}, ${mongoColors.blue.main})`,
                  },
                }}
              >
                <CardContent sx={{ pt: 3.5 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "center", mb: 2 }}
                  >
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        background: `linear-gradient(135deg, ${mongoColors.green.main}, ${mongoColors.green.dark})`,
                        mr: 2,
                        fontSize: "1.1rem",
                        fontWeight: 600,
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
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
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions
                  sx={{
                    gap: 1,
                    flexDirection: "column",
                    alignItems: "stretch",
                    px: 2,
                    pb: 2,
                  }}
                >
                  <FormControl size="small" fullWidth>
                    <Select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value)
                      }
                      variant="outlined"
                      size="small"
                    >
                      <MenuItem value="participant">Participant</MenuItem>
                      <MenuItem value="mentor">Mentor</MenuItem>
                      <MenuItem value="judge">Judge</MenuItem>
                      <MenuItem value="organizer">Organizer</MenuItem>
                      <MenuItem value="marketer">Marketer</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="super_admin">Super Admin</MenuItem>
                    </Select>
                  </FormControl>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditOutlined />}
                      onClick={() => setEditUser(user)}
                      sx={{ flex: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() =>
                        handleViewAsUser(user._id, user.name)
                      }
                      sx={{ flex: 1 }}
                    >
                      View As
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialogs */}
      <AddUserDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={handleAddSuccess}
      />
      <EditUserDialog
        open={!!editUser}
        user={editUser}
        onClose={() => setEditUser(null)}
        onSuccess={handleEditSuccess}
      />

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
