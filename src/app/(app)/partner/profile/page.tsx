"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Business as ProfileIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

interface PartnerProfile {
  name: string;
  description: string;
  logo: string;
  website: string;
  industry: string;
  tier: string;
  status: string;
  companyInfo: {
    size?: string;
    headquarters?: string;
    foundedYear?: number;
    employeeCount?: string;
  };
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    youtube?: string;
  };
  tags: string[];
}

export default function PartnerProfilePage() {
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Editable fields
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [website, setWebsite] = useState("");
  const [headquarters, setHeadquarters] = useState("");
  const [size, setSize] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [github, setGithub] = useState("");
  const [youtube, setYoutube] = useState("");
  const [tags, setTags] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/partner/profile");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load profile");
      const p = data.partner;
      setProfile(p);
      setDescription(p.description || "");
      setLogo(p.logo || "");
      setWebsite(p.website || "");
      setHeadquarters(p.companyInfo?.headquarters || "");
      setSize(p.companyInfo?.size || "");
      setEmployeeCount(p.companyInfo?.employeeCount || "");
      setLinkedin(p.social?.linkedin || "");
      setTwitter(p.social?.twitter || "");
      setGithub(p.social?.github || "");
      setYoutube(p.social?.youtube || "");
      setTags((p.tags || []).join(", "));
    } catch {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/partner/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          logo,
          website,
          companyInfo: {
            size: size || undefined,
            headquarters: headquarters || undefined,
            employeeCount: employeeCount || undefined,
          },
          social: {
            linkedin: linkedin || undefined,
            twitter: twitter || undefined,
            github: github || undefined,
            youtube: youtube || undefined,
          },
          tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return <Alert severity="error">Failed to load partner profile</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <ProfileIcon color="primary" />
        <Typography variant="h5" fontWeight={700}>
          Company Profile
        </Typography>
      </Box>

      {/* Read-only info */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Admin-managed fields (contact an admin to change these)
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Chip label={`Name: ${profile.name}`} />
            <Chip label={`Tier: ${profile.tier}`} />
            <Chip label={`Status: ${profile.status}`} />
            <Chip label={`Industry: ${profile.industry}`} />
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {/* Editable fields */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Company Details
          </Typography>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={4}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Logo URL" value={logo} onChange={(e) => setLogo(e.target.value)} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Headquarters" value={headquarters} onChange={(e) => setHeadquarters(e.target.value)} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Company Size" value={size} onChange={(e) => setSize(e.target.value)} fullWidth placeholder="e.g., startup, small, medium, large, enterprise" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Employee Count" value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} fullWidth />
            </Grid>
            <Grid size={12}>
              <TextField label="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} fullWidth />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Social Links
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="LinkedIn" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Twitter / X" value={twitter} onChange={(e) => setTwitter(e.target.value)} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="GitHub" value={github} onChange={(e) => setGithub(e.target.value)} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="YouTube" value={youtube} onChange={(e) => setYoutube(e.target.value)} fullWidth />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
