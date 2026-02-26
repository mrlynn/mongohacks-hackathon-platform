"use client";

import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  Grid,
  Alert,
  LinearProgress,
  Autocomplete,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Event as EventIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Code as CodeIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as SuccessIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

interface RegistrationClientProps {
  event: any;
  eventId: string;
  registeredCount: number;
  spotsRemaining: number | null;
  isLoggedIn: boolean;
  userEmail?: string;
  userName?: string;
}

const skillOptions = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust",
  "React", "Vue", "Angular", "Next.js", "Node.js", "Express",
  "MongoDB", "PostgreSQL", "MySQL", "Redis",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes",
  "GraphQL", "REST API", "WebSockets",
  "Machine Learning", "AI", "Data Science",
  "UI/UX Design", "Product Management", "DevOps",
];

export default function RegistrationClient({
  event,
  eventId,
  registeredCount,
  spotsRemaining,
  isLoggedIn,
  userEmail,
  userName,
}: RegistrationClientProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: userName || "",
    email: userEmail || "",
    password: "",
    skills: [] as string[],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Client-side validation
    if (!isLoggedIn && formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsSubmitting(false);
      return;
    }

    if (formData.skills.length === 0) {
      setError("Please select at least one skill");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        email: formData.email,
        skills: formData.skills,
      };

      // Only send password for new users (not logged in)
      if (!isLoggedIn) {
        payload.password = formData.password;
      }

      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle existing user — redirect to login
        if (data.code === "EXISTING_USER" && data.loginUrl) {
          setError("");
          router.push(data.loginUrl);
          return;
        }
        throw new Error(data.error || "Failed to register");
      }

      setSuccess(true);

      // Auto-login if not logged in, then redirect to hub
      if (!isLoggedIn && formData.password) {
        const signInResult = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (signInResult?.ok) {
          // Full page reload so server picks up the new session cookie
          window.location.href = `/events/${eventId}/hub`;
        } else {
          // Sign-in failed but registration succeeded — send to login
          window.location.href = `/login?redirect=/events/${eventId}/hub`;
        }
      } else {
        // Already logged in — full reload to hub
        window.location.href = `/events/${eventId}/hub`;
      }
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
      setSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <SuccessIcon sx={{ fontSize: 80, color: "success.main" }} />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            You're In!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome to {event.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Taking you to your Event Hub...
          </Typography>
          <LinearProgress sx={{ width: "100%", maxWidth: 400 }} />
        </Box>
      </Container>
    );
  }

  const percentFull = spotsRemaining !== null
    ? Math.round((registeredCount / event.capacity) * 100)
    : null;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* Event Header */}
      <Card elevation={2} sx={{ mb: 3, bgcolor: "primary.main", color: "white" }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <EventIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Register for {event.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          {/* Capacity Info */}
          {spotsRemaining !== null && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="caption">
                  {registeredCount} / {event.capacity} registered
                </Typography>
                <Typography variant="caption">
                  {spotsRemaining} spots left
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={percentFull || 0}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  bgcolor: "rgba(255,255,255,0.3)",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: spotsRemaining < 10 ? "warning.light" : "success.light",
                  },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Registration Form */}
      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Quick Registration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Just the essentials — you can complete your profile later.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              {/* Name */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isLoggedIn && !!userName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: "action.active" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Email */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoggedIn && !!userEmail}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: "action.active" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Password (only for new users) */}
              {!isLoggedIn && (
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    required
                    type={showPassword ? "text" : "password"}
                    label="Create Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    helperText="At least 8 characters"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "action.active" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}

              {/* Skills */}
              <Grid size={{ xs: 12 }}>
                <Autocomplete
                  multiple
                  options={skillOptions}
                  value={formData.skills}
                  onChange={(_, newValue) => setFormData({ ...formData, skills: newValue })}
                  freeSolo
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option}
                        {...getTagProps({ index })}
                        key={option}
                        color="primary"
                        size="small"
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Your Skills"
                      placeholder={formData.skills.length === 0 ? "Pick 2-3 skills..." : ""}
                      required={formData.skills.length === 0}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <CodeIcon sx={{ color: "action.active" }} />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                      helperText="Helps us match you with the right team"
                    />
                  )}
                />
              </Grid>

              {/* Submit Button */}
              <Grid size={{ xs: 12 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{ py: 1.5 }}
                >
                  {isSubmitting ? "Registering..." : "Register & Get Started"}
                </Button>
              </Grid>

              {!isLoggedIn && (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" variant="outlined">
                    Already have an account?{" "}
                    <Button
                      size="small"
                      onClick={() => router.push(`/login?redirect=/events/${eventId}/register`)}
                    >
                      Log in first
                    </Button>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
