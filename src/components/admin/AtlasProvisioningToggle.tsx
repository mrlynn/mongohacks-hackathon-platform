'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Storage as StorageIcon, CheckCircle as CheckIcon } from '@mui/icons-material';

interface AtlasProvisioningToggleProps {
  eventId: string;
  initialEnabled: boolean;
  onUpdate?: (enabled: boolean) => void;
}

export default function AtlasProvisioningToggle({
  eventId,
  initialEnabled,
  onUpdate,
}: AtlasProvisioningToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleToggle = async (checked: boolean) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const res = await fetch(`/api/admin/events/${eventId}/atlas-provisioning`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: checked }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update Atlas provisioning');
      }

      setEnabled(checked);
      setSuccess(true);
      onUpdate?.(checked);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError((err as Error).message);
      // Revert toggle on error
      setEnabled(!checked);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <StorageIcon color="primary" />
          <Typography variant="h6">Atlas Cluster Provisioning</Typography>
          {enabled && <Chip label="Enabled" color="success" size="small" />}
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          Allow teams to provision free MongoDB Atlas M0 clusters (512 MB) for this event.
          Teams can manage database users and IP access lists through the platform.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 2 }}>
            Atlas provisioning {enabled ? 'enabled' : 'disabled'} successfully
          </Alert>
        )}

        <FormControlLabel
          control={
            <Switch
              checked={enabled}
              onChange={(e) => handleToggle(e.target.checked)}
              disabled={loading}
            />
          }
          label={
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2">
                {enabled ? 'Enabled' : 'Disabled'}
              </Typography>
              {loading && <CircularProgress size={16} />}
            </Box>
          }
        />

        {enabled && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption" component="div">
              <strong>Default Configuration:</strong>
            </Typography>
            <Typography variant="caption" component="div">
              • Provider: AWS (teams can choose AWS, GCP, or Azure)
            </Typography>
            <Typography variant="caption" component="div">
              • Region: US_EAST_1 (configurable)
            </Typography>
            <Typography variant="caption" component="div">
              • Network Access: Open (0.0.0.0/0)
            </Typography>
            <Typography variant="caption" component="div">
              • Max DB Users: 5 per cluster
            </Typography>
            <Typography variant="caption" component="div">
              • Auto-cleanup: When event concludes
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
