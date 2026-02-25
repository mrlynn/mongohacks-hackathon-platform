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
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  Alert,
  Tab,
  Tabs,
  InputAdornment,
} from "@mui/material";
import {
  LockOutlined,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  SettingsOutlined,
  EmailOutlined,
  AccountCircleOutlined,
} from "@mui/icons-material";
import {
  PageHeader,
  FormSectionHeader,
} from "@/components/shared-ui/FormElements";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SettingsClient({ user }: { user: User }) {
  const [tab, setTab] = useState(0);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    eventReminders: true,
    teamInvites: true,
    projectUpdates: true,
    newsletterSubscription: false,
  });

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setError(data.message || "Failed to update password");
      }
    } catch (err) {
      setError("Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Notification preferences saved!");
      } else {
        setError(data.message || "Failed to save preferences");
      }
    } catch (err) {
      setError("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageHeader
        icon={<SettingsOutlined />}
        title="Settings"
        subtitle="Manage your account settings and preferences"
      />

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
            <Tab
              icon={<SecurityIcon />}
              label="Security"
              iconPosition="start"
            />
            <Tab
              icon={<NotificationsIcon />}
              label="Notifications"
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          {/* Security Tab */}
          <TabPanel value={tab} index={0}>
            <FormSectionHeader
              icon={<LockOutlined />}
              title="Change Password"
              subtitle="Update your account password"
            />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  type="password"
                  label="Current Password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined
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
                  type="password"
                  label="New Password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  helperText="Must be at least 8 characters"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined
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
                  type="password"
                  label="Confirm New Password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined
                            sx={{ color: "text.secondary", fontSize: 20 }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handlePasswordChange}
                  disabled={
                    saving ||
                    !passwordData.currentPassword ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword
                  }
                >
                  {saving ? "Updating..." : "Update Password"}
                </Button>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <FormSectionHeader
              icon={<AccountCircleOutlined />}
              title="Account Information"
              subtitle="Your account details"
            />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <EmailOutlined
                  sx={{ color: "text.secondary", fontSize: 20 }}
                />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{user.email}</Typography>
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
                    {user.role}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={tab} index={1}>
            <FormSectionHeader
              icon={<NotificationsIcon />}
              title="Email Notifications"
              subtitle="Control which emails you receive"
            />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.emailNotifications}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        emailNotifications: e.target.checked,
                      })
                    }
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">
                      Email Notifications
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Receive all email notifications
                    </Typography>
                  </Box>
                }
              />

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.eventReminders}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        eventReminders: e.target.checked,
                      })
                    }
                    disabled={!notifications.emailNotifications}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Event Reminders</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Get reminders about upcoming events
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.teamInvites}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        teamInvites: e.target.checked,
                      })
                    }
                    disabled={!notifications.emailNotifications}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Team Invites</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Receive notifications when invited to teams
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.projectUpdates}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        projectUpdates: e.target.checked,
                      })
                    }
                    disabled={!notifications.emailNotifications}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Project Updates</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Stay updated on your team&apos;s project progress
                    </Typography>
                  </Box>
                }
              />

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.newsletterSubscription}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        newsletterSubscription: e.target.checked,
                      })
                    }
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Newsletter</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Subscribe to our newsletter for hackathon updates
                    </Typography>
                  </Box>
                }
              />

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleNotificationSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Preferences"}
                </Button>
              </Box>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>
    </Container>
  );
}
