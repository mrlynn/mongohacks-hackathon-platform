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
  FormGroup,
  Checkbox,
  FormLabel,
} from '@mui/material';
import { Storage as StorageIcon, CheckCircle as CheckIcon, Cloud as CloudIcon } from '@mui/icons-material';

interface AtlasProvisioningToggleProps {
  eventId: string;
  initialEnabled: boolean;
  initialAllowedProviders?: string[];
  onUpdate?: (enabled: boolean, allowedProviders: string[]) => void;
}

const CLOUD_PROVIDERS = [
  { value: 'AWS', label: 'Amazon Web Services (AWS)' },
  { value: 'GCP', label: 'Google Cloud Platform (GCP)' },
  { value: 'AZURE', label: 'Microsoft Azure' },
];

export default function AtlasProvisioningToggle({
  eventId,
  initialEnabled,
  initialAllowedProviders = ['AWS', 'GCP', 'AZURE'],
  onUpdate,
}: AtlasProvisioningToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [allowedProviders, setAllowedProviders] = useState<string[]>(initialAllowedProviders);
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
        body: JSON.stringify({ enabled: checked, allowedProviders }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update Atlas provisioning');
      }

      setEnabled(checked);
      setSuccess(true);
      onUpdate?.(checked, allowedProviders);

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

  const handleProviderChange = async (provider: string, checked: boolean) => {
    let newProviders: string[];
    
    if (checked) {
      newProviders = [...allowedProviders, provider];
    } else {
      newProviders = allowedProviders.filter((p) => p !== provider);
    }

    // Prevent unchecking all providers
    if (newProviders.length === 0) {
      setError('At least one cloud provider must be enabled');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const res = await fetch(`/api/admin/events/${eventId}/atlas-provisioning`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, allowedProviders: newProviders }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update allowed providers');
      }

      setAllowedProviders(newProviders);
      setSuccess(true);
      onUpdate?.(enabled, newProviders);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError((err as Error).message);
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
            Atlas provisioning settings updated successfully
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
          <Box sx={{ mt: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <CloudIcon fontSize="small" color="action" />
              <FormLabel component="legend">
                <Typography variant="subtitle2">Allowed Cloud Providers</Typography>
              </FormLabel>
            </Box>
            
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
              Select which cloud providers teams can use to deploy their clusters.
              This is useful when an event is sponsored by a specific cloud vendor.
            </Typography>

            <FormGroup>
              {CLOUD_PROVIDERS.map((provider) => (
                <FormControlLabel
                  key={provider.value}
                  control={
                    <Checkbox
                      checked={allowedProviders.includes(provider.value)}
                      onChange={(e) => handleProviderChange(provider.value, e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label={<Typography variant="body2">{provider.label}</Typography>}
                />
              ))}
            </FormGroup>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption" component="div">
                <strong>Default Configuration:</strong>
              </Typography>
              <Typography variant="caption" component="div">
                • Default Provider: {allowedProviders[0] || 'AWS'}
              </Typography>
              <Typography variant="caption" component="div">
                • Default Region: US_EAST_1
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
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
