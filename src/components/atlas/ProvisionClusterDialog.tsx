'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stack,
  Typography,
  CircularProgress,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

interface ProvisionClusterDialogProps {
  open: boolean;
  onClose: () => void;
  teamId: string;
  projectId: string;
  allowedProviders: string[];
  onSuccess: () => void;
}

interface ProvisionResponse {
  cluster: {
    id: string;
    connectionString: string;
  };
  credentials: {
    username: string;
    password: string;
  };
}

const PROVIDER_LABELS: Record<string, string> = {
  AWS: 'Amazon Web Services (AWS)',
  GCP: 'Google Cloud Platform (GCP)',
  AZURE: 'Microsoft Azure',
};

export default function ProvisionClusterDialog({
  open,
  onClose,
  teamId,
  projectId,
  allowedProviders,
  onSuccess,
}: ProvisionClusterDialogProps) {
  const [provider, setProvider] = useState<string>(allowedProviders[0] || 'AWS');
  const [region, setRegion] = useState('US_EAST_1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProvisionResponse | null>(null);
  const [copied, setCopied] = useState<{ username: boolean; password: boolean; connection: boolean }>({
    username: false,
    password: false,
    connection: false,
  });

  // Update provider to first allowed provider when allowedProviders changes
  useEffect(() => {
    if (allowedProviders.length > 0 && !allowedProviders.includes(provider)) {
      setProvider(allowedProviders[0]);
    }
  }, [allowedProviders, provider]);

  const handleProvision = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/atlas/clusters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          projectId,
          provider,
          region,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to provision cluster');
      }

      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (result) {
      onSuccess();
    }
    setResult(null);
    setError(null);
    onClose();
  };

  const copyToClipboard = (text: string, field: 'username' | 'password' | 'connection') => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [field]: true });
    setTimeout(() => setCopied({ ...copied, [field]: false }), 2000);
  };

  if (result) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CheckIcon color="success" />
            <Typography variant="h6">Cluster Provisioning Started</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 3 }}>
            Your MongoDB Atlas M0 cluster is being created. This may take 5-10 minutes.
          </Alert>

          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              ⚠️ Save These Credentials Now
            </Typography>
            <Typography variant="body2">
              This is the only time you'll see the database password. Make sure to copy it somewhere safe!
            </Typography>
          </Alert>

          <Stack spacing={2}>
            {/* Username */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Database Username
              </Typography>
              <Box display="flex" alignItems="center" gap={1} bgcolor="grey.100" p={1.5} borderRadius={1}>
                <Typography variant="body2" fontFamily="monospace" sx={{ flex: 1 }}>
                  {result.credentials.username}
                </Typography>
                <Tooltip title={copied.username ? 'Copied!' : 'Copy'}>
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(result.credentials.username, 'username')}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Password */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Database Password
              </Typography>
              <Box display="flex" alignItems="center" gap={1} bgcolor="grey.100" p={1.5} borderRadius={1}>
                <Typography variant="body2" fontFamily="monospace" sx={{ flex: 1, wordBreak: 'break-all' }}>
                  {result.credentials.password}
                </Typography>
                <Tooltip title={copied.password ? 'Copied!' : 'Copy'}>
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(result.credentials.password, 'password')}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Connection String */}
            {result.cluster.connectionString && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Connection String (available once cluster is active)
                </Typography>
                <Box display="flex" alignItems="center" gap={1} bgcolor="grey.100" p={1.5} borderRadius={1}>
                  <Typography
                    variant="body2"
                    fontFamily="monospace"
                    sx={{ flex: 1, wordBreak: 'break-all' }}
                  >
                    {result.cluster.connectionString.replace('<password>', result.credentials.password)}
                  </Typography>
                  <Tooltip title={copied.connection ? 'Copied!' : 'Copy'}>
                    <IconButton
                      size="small"
                      onClick={() =>
                        copyToClipboard(
                          result.cluster.connectionString.replace('<password>', result.credentials.password),
                          'connection'
                        )
                      }
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Provision MongoDB Atlas Cluster</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Alert severity="info">
            Your team will get a free MongoDB Atlas M0 cluster (512 MB storage).
            Perfect for hackathon projects!
          </Alert>

          {error && <Alert severity="error">{error}</Alert>}

          <FormControl fullWidth>
            <InputLabel>Cloud Provider</InputLabel>
            <Select
              value={provider}
              label="Cloud Provider"
              onChange={(e) => setProvider(e.target.value)}
              disabled={loading}
            >
              {allowedProviders.map((p) => (
                <MenuItem key={p} value={p}>
                  {PROVIDER_LABELS[p] || p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            disabled={loading}
            helperText="Default: US_EAST_1 (Virginia)"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleProvision}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Provisioning...' : 'Provision Cluster'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
