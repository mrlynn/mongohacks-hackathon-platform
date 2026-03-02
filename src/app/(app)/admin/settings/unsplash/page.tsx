"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Snackbar,
  Chip,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Save as SaveIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

interface KeyStatus {
  source: "database" | "environment" | null;
  hint: string | null;
}

export default function UnsplashSettingsPage() {
  const [accessKey, setAccessKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [accessKeyStatus, setAccessKeyStatus] = useState<KeyStatus>({
    source: null,
    hint: null,
  });
  const [secretKeyStatus, setSecretKeyStatus] = useState<KeyStatus>({
    source: null,
    hint: null,
  });
  const [showAccessKey, setShowAccessKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings/unsplash");
      if (!res.ok) throw new Error("Failed to load settings");
      const data = await res.json();
      setAccessKeyStatus(data.accessKey);
      setSecretKeyStatus(data.secretKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const body: Record<string, string> = {};
      if (accessKey) body.accessKey = accessKey;
      if (secretKey) body.secretKey = secretKey;

      if (Object.keys(body).length === 0) {
        setError("Enter at least one key to save");
        setSaving(false);
        return;
      }

      const res = await fetch("/api/admin/settings/unsplash", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setAccessKey("");
      setSecretKey("");
      setSuccess("Unsplash credentials saved");
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings/unsplash", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessKey: "", secretKey: "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Clear failed");

      setAccessKey("");
      setSecretKey("");
      setSuccess("Database overrides cleared — using environment variables");
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Clear failed");
    } finally {
      setSaving(false);
    }
  };

  const sourceChip = (status: KeyStatus) => {
    if (!status.source)
      return <Chip label="Not configured" size="small" color="error" />;
    if (status.source === "database")
      return <Chip label={`DB override (${status.hint})`} size="small" color="primary" />;
    return <Chip label={`Environment (${status.hint})`} size="small" color="default" />;
  };

  if (loading) return null;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Unsplash API
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure Unsplash API credentials for the image search feature.
          Database overrides take priority over environment variables.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            Current Status
          </Typography>
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Access Key
              </Typography>
              {sourceChip(accessKeyStatus)}
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Secret Key
              </Typography>
              {sourceChip(secretKeyStatus)}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
            Update Credentials
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter new keys to override the environment variables. Leave blank to keep current values.
          </Typography>

          <TextField
            label="Access Key"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            type={showAccessKey ? "text" : "password"}
            fullWidth
            sx={{ mb: 2 }}
            placeholder="Enter Unsplash access key"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowAccessKey(!showAccessKey)}
                      edge="end"
                      size="small"
                    >
                      {showAccessKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Secret Key"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            type={showSecretKey ? "text" : "password"}
            fullWidth
            placeholder="Enter Unsplash secret key"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      edge="end"
                      size="small"
                    >
                      {showSecretKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving || (!accessKey && !secretKey)}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
        {(accessKeyStatus.source === "database" ||
          secretKeyStatus.source === "database") && (
          <Button
            variant="outlined"
            color="warning"
            onClick={handleClear}
            disabled={saving}
          >
            Clear DB Overrides
          </Button>
        )}
      </Box>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess("")}
        message={success}
      />
    </Box>
  );
}
