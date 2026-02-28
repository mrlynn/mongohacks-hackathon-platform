'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import Link from 'next/link';

interface Cluster {
  _id: string;
  atlasProjectName: string;
  atlasClusterName: string;
  status: string;
  providerName: string;
  regionName: string;
  createdAt: string;
  eventId: { _id: string; name: string; status: string };
  teamId: { _id: string; name: string };
  projectId: { _id: string; name: string };
  provisionedBy: { _id: string; name: string; email: string };
}

interface Stats {
  total: number;
  byStatus: Record<string, number>;
}

export default function AdminClusterOverview() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, byStatus: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('');

  const fetchClusters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (eventFilter) params.set('eventId', eventFilter);

      const res = await fetch(`/api/atlas/admin/clusters?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch clusters');

      setClusters(data.clusters);
      setStats(data.stats);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCluster = async (clusterId: string, clusterName: string) => {
    if (!confirm(`Delete cluster "${clusterName}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/atlas/admin/clusters/${clusterId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete cluster');
      }

      await fetchClusters();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    fetchClusters();
  }, [statusFilter, eventFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'idle':
        return 'success';
      case 'creating':
        return 'info';
      case 'deleting':
        return 'warning';
      case 'error':
        return 'error';
      case 'deleted':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h6">Atlas Cluster Overview</Typography>
            <Typography variant="body2" color="text.secondary">
              {stats.total} total clusters
            </Typography>
          </Box>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchClusters} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Stats Summary */}
        <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <Chip
              key={status}
              label={`${status}: ${count}`}
              color={getStatusColor(status)}
              size="small"
            />
          ))}
        </Stack>

        {/* Filters */}
        <Stack direction="row" spacing={2} mb={3}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="creating">Creating</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="idle">Idle</MenuItem>
              <MenuItem value="deleting">Deleting</MenuItem>
              <MenuItem value="deleted">Deleted</MenuItem>
              <MenuItem value="error">Error</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Event ID"
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            placeholder="Filter by event..."
            sx={{ minWidth: 200 }}
          />

          {(statusFilter !== 'all' || eventFilter) && (
            <Button
              size="small"
              onClick={() => {
                setStatusFilter('all');
                setEventFilter('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : clusters.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            No clusters found
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Cluster</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Provisioned By</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clusters.map((cluster) => (
                  <TableRow key={cluster._id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {cluster.atlasClusterName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cluster.atlasProjectName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/events/${cluster.eventId._id}`}>
                        <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                          {cluster.eventId.name}
                        </Typography>
                      </Link>
                      <Chip
                        label={cluster.eventId.status}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </TableCell>
                    <TableCell>
                      {cluster.teamId ? (
                        <Link href={`/teams/${cluster.teamId._id}`}>
                          <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                            {cluster.teamId.name}
                          </Typography>
                        </Link>
                      ) : '—'}
                    </TableCell>
                    <TableCell>{cluster.projectId?.name || '—'}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {cluster.providerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cluster.regionName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={cluster.status}
                        color={getStatusColor(cluster.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {cluster.provisionedBy.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cluster.provisionedBy.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(cluster.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="View team page">
                          <IconButton
                            size="small"
                            component={Link}
                            href={`/teams/${cluster.teamId._id}/atlas`}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {cluster.status !== 'deleted' && cluster.status !== 'deleting' && (
                          <Tooltip title="Force delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                handleDeleteCluster(cluster._id, cluster.atlasClusterName)
                              }
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}
