'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tooltip,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';

interface DatabaseUserManagerProps {
  clusterId: string;
  isTeamLeader: boolean;
}

interface DbUser {
  username: string;
  databaseName: string;
  roles: Array<{ roleName: string; databaseName: string }>;
}

export default function DatabaseUserManager({
  clusterId,
  isTeamLeader,
}: DatabaseUserManagerProps) {
  const [users, setUsers] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ username: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/atlas/clusters/${clusterId}/database-users`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch users');

      setUsers(data.users);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUsername.trim()) return;

    try {
      setCreating(true);
      const res = await fetch(`/api/atlas/clusters/${clusterId}/database-users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername.trim() }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      setCreatedCredentials(data.user);
      await fetchUsers();
      setNewUsername('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (!confirm(`Delete database user "${username}"?`)) return;

    try {
      const res = await fetch(
        `/api/atlas/clusters/${clusterId}/database-users/${encodeURIComponent(username)}`,
        { method: 'DELETE' }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      await fetchUsers();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    fetchUsers();
  }, [clusterId]);

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Database Users</Typography>
          {isTeamLeader && (
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              size="small"
              onClick={() => setCreateDialogOpen(true)}
            >
              Add User
            </Button>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            No database users yet
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Database</TableCell>
                  <TableCell>Roles</TableCell>
                  {isTeamLeader && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {user.username}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.databaseName}</TableCell>
                    <TableCell>
                      {user.roles.map((r) => `${r.roleName} (${r.databaseName})`).join(', ')}
                    </TableCell>
                    {isTeamLeader && (
                      <TableCell align="right">
                        <Tooltip title="Delete user">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteUser(user.username)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Create User Dialog */}
        <Dialog
          open={createDialogOpen && !createdCredentials}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create Database User</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              label="Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              disabled={creating}
              sx={{ mt: 2 }}
              helperText="Password will be auto-generated"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              variant="contained"
              disabled={creating || !newUsername.trim()}
              startIcon={creating && <CircularProgress size={20} />}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Credentials Dialog */}
        <Dialog
          open={!!createdCredentials}
          onClose={() => {
            setCreatedCredentials(null);
            setCreateDialogOpen(false);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>User Created</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 3 }}>
              ⚠️ Save this password now! It won't be shown again.
            </Alert>

            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Username
                </Typography>
                <Box display="flex" alignItems="center" gap={1} bgcolor="grey.100" p={1.5} borderRadius={1}>
                  <Typography variant="body2" fontFamily="monospace" sx={{ flex: 1 }}>
                    {createdCredentials?.username}
                  </Typography>
                  <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(createdCredentials?.username || '')}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Password
                </Typography>
                <Box display="flex" alignItems="center" gap={1} bgcolor="grey.100" p={1.5} borderRadius={1}>
                  <Typography variant="body2" fontFamily="monospace" sx={{ flex: 1, wordBreak: 'break-all' }}>
                    {createdCredentials?.password}
                  </Typography>
                  <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(createdCredentials?.password || '')}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setCreatedCredentials(null);
                setCreateDialogOpen(false);
              }}
              variant="contained"
            >
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
