"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Grid,
  InputAdornment,
} from "@mui/material";
import {
  CheckCircleOutline as CheckCircleIcon,
  PersonOutlined,
  EmailOutlined,
  LockOutlined,
  GitHub as GitHubIcon,
  BuildOutlined,
  SchoolOutlined,
  NotesOutlined,
  GavelOutlined,
  CodeOutlined,
  EventOutlined,
  LocationOnOutlined,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mongoColors } from "@/styles/theme";
import {
  PageHeader,
  FormCard,
  FormSectionHeader,
} from "@/components/shared-ui/FormElements";

interface Event {
  _id: string;
  name: string;
  theme: string;
  startDate: string;
  endDate: string;
  location: string;
}

export default function RegisterPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const router = useRouter();
  const [eventId, setEventId] = useState("");
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    githubUsername: "",
    bio: "",
    skills: "",
    experienceLevel: "intermediate" as "beginner" | "intermediate" | "advanced",
    acceptTerms: false,
    acceptCodeOfConduct: false,
  });

  useEffect(() => {
    params.then((p) => {
      setEventId(p.eventId);
      fetchEvent(p.eventId);
    });
  }, []);

  const fetchEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/events/${id}`);
      const data = await res.json();
      if (data.event) {
        setEvent(data.event);
      }
    } catch (err) {
      setError("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Valid email is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!formData.acceptTerms) {
      setError("You must accept the terms and conditions");
      return false;
    }
    if (!formData.acceptCodeOfConduct) {
      setError("You must accept the code of conduct");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">Event not found</Alert>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <CheckCircleIcon
              className="success-icon"
              sx={{ fontSize: 80, color: "success.main", mb: 2 }}
            />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Registration Successful!
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              You&apos;ve been registered for {event.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting to dashboard...
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h3"
          sx={{ fontWeight: 700, mb: 3 }}
        >
          Register for Hackathon
        </Typography>
        <Card
          sx={{
            background: `linear-gradient(135deg, ${mongoColors.green.main} 0%, ${mongoColors.slate.light} 100%)`,
            color: "white",
            mb: 3,
            border: "none",
          }}
        >
          <CardContent sx={{ py: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                mb: 1,
              }}
            >
              <EventOutlined sx={{ fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {event.name}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {new Date(event.startDate).toLocaleDateString()} -{" "}
              {new Date(event.endDate).toLocaleDateString()}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                mt: 1,
                opacity: 0.8,
              }}
            >
              <LocationOnOutlined sx={{ fontSize: 16 }} />
              <Typography variant="body2">{event.location}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <FormCard>
          <FormSectionHeader
            icon={<PersonOutlined />}
            title="Personal Information"
            subtitle="Your account details"
          />

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
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
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined
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
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                helperText="Minimum 8 characters"
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

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
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
          </Grid>
        </FormCard>

        {/* Hacker Profile */}
        <FormCard
          accentColor={mongoColors.blue.main}
          accentColorEnd={mongoColors.purple.main}
        >
          <FormSectionHeader
            icon={<CodeOutlined />}
            title="Hacker Profile"
            subtitle="Tell us about your skills and experience"
          />

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="GitHub Username"
                name="githubUsername"
                value={formData.githubUsername}
                onChange={handleChange}
                helperText="Your GitHub profile (e.g., 'octocat')"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <GitHubIcon
                          sx={{ color: "text.secondary", fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Experience Level</InputLabel>
                <Select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  label="Experience Level"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      experienceLevel: e.target.value as any,
                    }))
                  }
                  startAdornment={
                    <InputAdornment position="start">
                      <SchoolOutlined
                        sx={{ color: "text.secondary", fontSize: 20 }}
                      />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                helperText="Comma-separated (e.g., Python, React, MongoDB)"
                placeholder="Python, JavaScript, MongoDB"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BuildOutlined
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
                label="Bio (Optional)"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                multiline
                rows={3}
                helperText="Tell us about yourself"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ alignSelf: "flex-start", mt: 1.5 }}
                      >
                        <NotesOutlined
                          sx={{ color: "text.secondary", fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
          </Grid>
        </FormCard>

        {/* Terms and Conditions */}
        <FormCard
          accentColor={mongoColors.slate.light}
          accentColorEnd={mongoColors.gray[600]}
        >
          <FormSectionHeader
            icon={<GavelOutlined />}
            title="Terms & Conditions"
            subtitle="Please review and accept"
          />

          <FormControlLabel
            control={
              <Checkbox
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                required
              />
            }
            label={
              <Typography variant="body2">
                I accept the{" "}
                <Box
                  component="a"
                  href="/terms"
                  target="_blank"
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  terms and conditions
                </Box>
              </Typography>
            }
            sx={{ mb: 1 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                name="acceptCodeOfConduct"
                checked={formData.acceptCodeOfConduct}
                onChange={handleChange}
                required
              />
            }
            label={
              <Typography variant="body2">
                I accept the{" "}
                <Box
                  component="a"
                  href="/code-of-conduct"
                  target="_blank"
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  code of conduct
                </Box>
              </Typography>
            }
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={submitting}
            sx={{ py: 1.5, fontSize: "1.1rem", fontWeight: 700 }}
          >
            {submitting ? "Registering..." : "Register for Event"}
          </Button>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link
                href={`/login?redirect=/events/${eventId}/teams`}
                style={{
                  textDecoration: "none",
                  color: "#00684A",
                  fontWeight: 600,
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </FormCard>
      </form>
    </Container>
  );
}
