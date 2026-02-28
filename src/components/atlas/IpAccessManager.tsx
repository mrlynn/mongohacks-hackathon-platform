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
} from '@mui/icons-material';

interface IpAccessManagerProps {
  clusterId: string;
  isTeamLeader: boolean;
}

interface IpEntry {
  cidrBlock?: string;
  ipAddress?: string;
  comment?: string;
}

export default function IpAccessManager({
  clusterId,
  isTeamLeader,
}: IpAccessManagerProps) {
  const [entries, setEntries] = useState<IpEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({ cidrBlock: '', comment: '' });
  const [adding, setAdding] = useState(false);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/atlas/clusters/${clusterId}/ip-access`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch IP access list');

      setEntries(data.entries);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.cidrBlock.trim()) return;

    try {
      setAdding(true);
      const res = await fetch(`/api/atlas/clusters/${clusterId}/ip-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: [
            {
              cidrBlock: newEntry.cidrBlock.trim(),
              comment: newEntry.comment.trim() || undefined,
            },
          ],
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to add IP access entry');

      await fetchEntries();
      setNewEntry({ cidrBlock: '', comment: '' });
      setAddDialogOpen(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteEntry = async (entry: string) => {
    if (!confirm(`Remove IP access for "${entry}"?`)) return;

    try {
      const res = await fetch(
        `/api/atlas/clusters/${clusterId}/ip-access?entry=${encodeURIComponent(entry)}`,
        { method: 'DELETE' }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove IP access entry');
      }

      await fetchEntries();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [clusterId]);

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">IP Access List</Typography>
          {isTeamLeader && (
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              size="small"
              onClick={() => setAddDialogOpen(true)}
            >
              Add IP
            </Button>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : entries.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            No IP access entries
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>CIDR Block / IP Address</TableCell>
                  <TableCell>Comment</TableCell>
                  {isTeamLeader && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map((entry, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {entry.cidrBlock || entry.ipAddress}
                      </Typography>
                    </TableCell>
                    <TableCell>{entry.comment || '—'}</TableCell>
                    {isTeamLeader && (
                      <TableCell align="right">
                        <Tooltip title="Remove entry">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleDeleteEntry(entry.cidrBlock || entry.ipAddress || '')
                            }
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

        {/* Add Entry Dialog */}
        <Dialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add IP Access Entry</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                autoFocus
                fullWidth
                label="CIDR Block or IP Address"
                placeholder="0.0.0.0/0 or 192.168.1.100"
                value={newEntry.cidrBlock}
                onChange={(e) => setNewEntry({ ...newEntry, cidrBlock: e.target.value })}
                disabled={adding}
                helperText="Use 0.0.0.0/0 to allow access from anywhere"
              />
              <TextField
                fullWidth
                label="Comment (optional)"
                placeholder="Development machine"
                value={newEntry.comment}
                onChange={(e) => setNewEntry({ ...newEntry, comment: e.target.value })}
                disabled={adding}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialogOpen(false)} disabled={adding}>
              Cancel
            </Button>
            <Button
              onClick={handleAddEntry}
              variant="contained"
              disabled={adding || !newEntry.cidrBlock.trim()}
              startIcon={adding && <CircularProgress size={20} />}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
