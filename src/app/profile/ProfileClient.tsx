"use client";

import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Chip,
  Grid,
  Divider,
  Alert,
  MenuItem,
} from "@mui/material";
import {
  Person as PersonIcon,
  Save as SaveIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

interface ProfileData {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
  participant: {
    _id: string;
    bio: string;
    skills: string[];
    interests: string[];
    experience_level: string;
  } | null;
}

export default function ProfileClient({ profile }: { profile: ProfileData }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: profile.user.name,
    bio: profile.participant?.bio || "",
    skills: profile.participant?.skills.join(", ") || "",
    interests: profile.participant?.interests.join(", ") || "",
    experience_level: profile.participant?.experience_level || "beginner",
  });

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
          skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
          interests: formData.interests.split(",").map((s) => s.trim()).filter(Boolean),
          experience_level: formData.experience_level,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Profile updated successfully!");
        setEditing(false);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account information and preferences
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* User Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "primary.main",
                fontSize: "2rem",
                fontWeight: 700,
                mr: 3,
              }}
            >
              {profile.user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {profile.user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile.user.email}
              </Typography>
              <Chip
                label={profile.user.role}
                size="small"
                color="primary"
                sx={{ mt: 1, textTransform: "capitalize" }}
              />
            </Box>
            {!editing && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            {/* Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!editing}
              />
            </Grid>

            {/* Bio */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!editing}
                placeholder="Tell us about yourself..."
              />
            </Grid>

            {/* Experience Level */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Experience Level"
                value={formData.experience_level}
                onChange={(e) =>
                  setFormData({ ...formData, experience_level: e.target.value })
                }
                disabled={!editing}
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </TextField>
            </Grid>

            {/* Member Since */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Member Since"
                value={new Date(profile.user.createdAt).toLocaleDateString()}
                disabled
              />
            </Grid>

            {/* Skills */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Skills"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                disabled={!editing}
                placeholder="JavaScript, Python, React, etc. (comma-separated)"
                helperText="Enter skills separated by commas"
              />
            </Grid>

            {/* Interests */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Interests"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                disabled={!editing}
                placeholder="AI, Web Development, Mobile, etc. (comma-separated)"
                helperText="Enter interests separated by commas"
              />
            </Grid>

            {/* Action Buttons */}
            {editing && (
              <Grid item xs={12}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: profile.user.name,
                        bio: profile.participant?.bio || "",
                        skills: profile.participant?.skills.join(", ") || "",
                        interests: profile.participant?.interests.join(", ") || "",
                        experience_level: profile.participant?.experience_level || "beginner",
                      });
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Account Information
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{profile.user.email}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Account Type
              </Typography>
              <Typography variant="body1" sx={{ textTransform: "capitalize" }}>
                {profile.user.role}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Member Since
              </Typography>
              <Typography variant="body1">
                {new Date(profile.user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
