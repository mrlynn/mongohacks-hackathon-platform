"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  Divider,
} from "@mui/material";
import {
  Business as BusinessIcon,
  CheckCircle as SuccessIcon,
} from "@mui/icons-material";

export default function PartnerRegistrationPage() {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/partners/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName,
          contactEmail,
          password,
          companyName,
          companyDescription,
          website,
          industry,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <Card variant="outlined" sx={{ maxWidth: 500, textAlign: "center" }}>
          <CardContent sx={{ py: 6 }}>
            <SuccessIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
            <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
              Request Submitted!
            </Typography>
            <Typography color="text.secondary">
              Your partner access request has been submitted and is pending admin approval.
              You will receive an email once your request has been reviewed.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <BusinessIcon color="primary" />
        <Typography variant="h5" fontWeight={700}>
          Partner Registration
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Register your company as a partner for MongoDB Hackathon events. Your request will be reviewed by an admin.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card variant="outlined">
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  label="Your Name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Email Address"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Company Details
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  label="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Company Description"
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  required
                  multiline
                  rows={3}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Website (optional)"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={saving}
              >
                {saving ? "Submitting..." : "Submit Partner Request"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
