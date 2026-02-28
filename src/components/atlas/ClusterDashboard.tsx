'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  Stack,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';

interface ClusterDashboardProps {
  teamId: string;
  eventId: string;
  isTeamLeader: boolean;
  onProvisionClick: () => void;
}

interface Cluster {
  _id: string;
  atlasProjectName: string;
  atlasClusterName: string;
  status: 'creating' | 'idle' | 'active' | 'deleting' | 'deleted' | 'error';
  connectionString: string;
  standardConnectionString: string;
  providerName: string;
  regionName: string;
  createdAt: string;
  errorMessage?: string;
}

export default function ClusterDashboard({
  teamId,
  eventId,
  isTeamLeader,
  onProvisionClick,
}: ClusterDashboardProps) {
  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingStatus, setPollingStatus] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchCluster = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/atlas/clusters?teamId=${teamId}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch cluster');

      setCluster(data.clusters?.[0] || null);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const pollStatus = async () => {
    if (!cluster) return;

    try {
      setPollingStatus(true);
      const res = await fetch(`/api/atlas/clusters/${cluster._id}/status`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to poll status');

      setCluster((prev) => prev ? { ...prev, status: data.cluster.status, connectionString: data.cluster.connectionString } : null);
    } catch (err) {
      console.error('Status poll failed:', err);
    } finally {
      setPollingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!cluster || !confirm('Are you sure you want to delete this cluster? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/atlas/clusters/${cluster._id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete cluster');
      }

      await fetchCluster();
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
    fetchCluster();
  }, [teamId]);

  // Auto-poll status if creating
  useEffect(() => {
    if (cluster?.status === 'creating') {
      const interval = setInterval(pollStatus, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [cluster?.status]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!cluster) {
    return (
      <Card>
        <CardContent>
          <Stack spacing={2} alignItems="center" py={4}>
            <StorageIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
            <Typography variant="h6" color="text.secondary">
              No Atlas Cluster
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Your team hasn't provisioned a MongoDB Atlas cluster yet.
            </Typography>
            {isTeamLeader && (
              <Button variant="contained" onClick={onProvisionClick} sx={{ mt: 2 }}>
                Provision Free Cluster
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  }

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
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">{cluster.atlasClusterName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {cluster.atlasProjectName}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title={pollingStatus ? 'Polling...' : 'Refresh status'}>
                <IconButton onClick={pollStatus} disabled={pollingStatus} size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              {isTeamLeader && cluster.status !== 'deleting' && cluster.status !== 'deleted' && (
                <Tooltip title="Delete cluster">
                  <IconButton onClick={handleDelete} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Box>

          {/* Status */}
          <Box>
            <Chip
              label={cluster.status.toUpperCase()}
              color={getStatusColor(cluster.status)}
              size="small"
            />
            {cluster.status === 'creating' && (
              <Typography variant="caption" display="block" mt={1} color="text.secondary">
                Cluster is being created. This may take 5-10 minutes.
              </Typography>
            )}
            {cluster.errorMessage && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {cluster.errorMessage}
              </Alert>
            )}
          </Box>

          <Divider />

          {/* Connection String */}
          {cluster.connectionString && cluster.status === 'active' && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Connection String
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                bgcolor="action.hover"
                p={1.5}
                borderRadius={1}
              >
                <Typography
                  variant="body2"
                  fontFamily="monospace"
                  sx={{ flex: 1, wordBreak: 'break-all' }}
                >
                  {cluster.connectionString}
                </Typography>
                <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(cluster.connectionString)}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )}

          {/* Metadata */}
          <Stack direction="row" spacing={3}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Provider
              </Typography>
              <Typography variant="body2">{cluster.providerName}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Region
              </Typography>
              <Typography variant="body2">{cluster.regionName}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body2">
                {new Date(cluster.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
