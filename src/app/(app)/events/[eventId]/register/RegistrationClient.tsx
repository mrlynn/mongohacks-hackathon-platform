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
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
} from "@mui/material";
import {
  Event as EventIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Code as CodeIcon,
  Lightbulb as LightbulbIcon,
  CheckCircle as SuccessIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

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

const interestOptions = [
  "Web Development", "Mobile Apps", "AI/ML", "Blockchain",
  "IoT", "Gaming", "FinTech", "HealthTech", "EdTech",
  "Social Impact", "Sustainability", "Open Source",
  "Data Visualization", "AR/VR", "Cybersecurity",
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
    bio: "",
    skills: [] as string[],
    interests: [] as string[],
    experience_level: "beginner" as "beginner" | "intermediate" | "advanced",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register");
      }

      setSuccess(true);
      
      // Redirect to event hub after 2 seconds
      setTimeout(() => {
        if (data.data.needsPasswordSetup) {
          // New user - redirect to password setup
          router.push(`/setup-password?email=${encodeURIComponent(formData.email)}`);
        } else {
          // Existing user - go to hub
          router.push(`/events/${eventId}/hub`);
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
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
            Registration Successful! 🎉
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You're all set for {event.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting to your Event Hub...
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
    <Container maxWidth="md" sx={{ py: 4 }}>
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
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Tell us about yourself
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isLoggedIn && !!userName}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: "action.active" }} />,
                  }}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoggedIn && !!userEmail}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: "action.active" }} />,
                  }}
                  helperText={
                    !isLoggedIn
                      ? "We'll send you event updates and team invitations"
                      : null
                  }
                />
              </Grid>

              {/* Bio */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Bio (Optional)"
                  placeholder="Tell us about yourself, your experience, and what you're excited to build..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </Grid>

              {/* Skills */}
              <Grid item xs={12}>
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
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Skills"
                      placeholder="Select or type your skills..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <CodeIcon sx={{ mr: 1, color: "action.active" }} />
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                      helperText="Select from suggestions or type your own"
                    />
                  )}
                />
              </Grid>

              {/* Interests */}
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={interestOptions}
                  value={formData.interests}
                  onChange={(_, newValue) => setFormData({ ...formData, interests: newValue })}
                  freeSolo
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option}
                        {...getTagProps({ index })}
                        key={option}
                        color="secondary"
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Interests"
                      placeholder="What are you interested in building?"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <LightbulbIcon sx={{ mr: 1, color: "action.active" }} />
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                      helperText="This helps us match you with the right team"
                    />
                  )}
                />
              </Grid>

              {/* Experience Level */}
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ mb: 1 }}>
                    Experience Level
                  </FormLabel>
                  <RadioGroup
                    row
                    value={formData.experience_level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experience_level: e.target.value as any,
                      })
                    }
                  >
                    <FormControlLabel
                      value="beginner"
                      control={<Radio />}
                      label="Beginner"
                    />
                    <FormControlLabel
                      value="intermediate"
                      control={<Radio />}
                      label="Intermediate"
                    />
                    <FormControlLabel
                      value="advanced"
                      control={<Radio />}
                      label="Advanced"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{ py: 1.5 }}
                >
                  {isSubmitting ? "Registering..." : "Complete Registration"}
                </Button>
              </Grid>

              {!isLoggedIn && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    Already have an account?{" "}
                    <Button
                      size="small"
                      onClick={() => router.push(`/login?redirect=/events/${eventId}/hub`)}
                    >
                      Log in instead
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
