"use client";

import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  Grid,
  Divider,
  Alert,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import {
  PersonOutlined,
  Save as SaveIcon,
  Edit as EditIcon,
  NotesOutlined,
  SchoolOutlined,
  CalendarTodayOutlined,
  EmailOutlined,
  AccountCircleOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { mongoColors } from "@/styles/theme";
import {
  PageHeader,
  FormCard,
  FormSectionHeader,
} from "@/components/shared-ui/FormElements";

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
          skills: formData.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          interests: formData.interests
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
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
      <PageHeader
        icon={<PersonOutlined />}
        title="My Profile"
        subtitle="Manage your account information and preferences"
      />

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

      <FormCard>
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            mb: 3,
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              background: `linear-gradient(135deg, ${mongoColors.green.main}, ${mongoColors.green.dark})`,
              fontSize: "2rem",
              fontWeight: 700,
              boxShadow: "0 4px 12px rgba(0, 104, 74, 0.3)",
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
              sx={{
                mt: 1,
                textTransform: "capitalize",
                bgcolor: `${mongoColors.green.main}0D`,
                color: mongoColors.green.dark,
                border: `1px solid ${mongoColors.green.main}33`,
                fontWeight: 600,
              }}
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
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={!editing}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlined
                        sx={{ color: "text.secondary", fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              disabled={!editing}
              placeholder="Tell us about yourself..."
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                      <NotesOutlined
                        sx={{ color: "text.secondary", fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
              label="Experience Level"
              value={formData.experience_level}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  experience_level: e.target.value,
                })
              }
              disabled={!editing}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolOutlined
                        sx={{ color: "text.secondary", fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            >
              <MenuItem value="beginner">Beginner</MenuItem>
              <MenuItem value="intermediate">Intermediate</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Member Since"
              value={new Date(profile.user.createdAt).toLocaleDateString()}
              disabled
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayOutlined
                        sx={{ color: "text.secondary", fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Skills"
              value={formData.skills}
              onChange={(e) =>
                setFormData({ ...formData, skills: e.target.value })
              }
              disabled={!editing}
              placeholder="JavaScript, Python, React, etc. (comma-separated)"
              helperText="Enter skills separated by commas"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Interests"
              value={formData.interests}
              onChange={(e) =>
                setFormData({ ...formData, interests: e.target.value })
              }
              disabled={!editing}
              placeholder="AI, Web Development, Mobile, etc. (comma-separated)"
              helperText="Enter interests separated by commas"
            />
          </Grid>

          {editing && (
            <Grid size={{ xs: 12 }}>
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
                      skills:
                        profile.participant?.skills.join(", ") || "",
                      interests:
                        profile.participant?.interests.join(", ") || "",
                      experience_level:
                        profile.participant?.experience_level || "beginner",
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
      </FormCard>

      <FormCard
        accentColor={mongoColors.blue.main}
        accentColorEnd={mongoColors.purple.main}
      >
        <FormSectionHeader
          icon={<InfoOutlined />}
          title="Account Information"
          subtitle="Your account details"
        />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <EmailOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{profile.user.email}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <AccountCircleOutlined
              sx={{ color: "text.secondary", fontSize: 20 }}
            />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Account Type
              </Typography>
              <Typography
                variant="body1"
                sx={{ textTransform: "capitalize" }}
              >
                {profile.user.role}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <CalendarTodayOutlined
              sx={{ color: "text.secondary", fontSize: 20 }}
            />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Member Since
              </Typography>
              <Typography variant="body1">
                {new Date(profile.user.createdAt).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </Typography>
            </Box>
          </Box>
        </Box>
      </FormCard>
    </Container>
  );
}
