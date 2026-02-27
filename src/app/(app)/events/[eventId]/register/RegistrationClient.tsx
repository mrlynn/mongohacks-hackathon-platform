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
  MenuItem,
  FormControl,
  FormControlLabel,
  Checkbox,
  Divider,
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
  GitHub as GitHubIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

interface CustomQuestion {
  id: string;
  label: string;
  type: "text" | "select" | "multiselect" | "checkbox";
  options: string[];
  required: boolean;
  placeholder: string;
}

interface FormConfig {
  _id: string;
  name: string;
  tier1: {
    showExperienceLevel: boolean;
    customQuestions: CustomQuestion[];
  };
  tier2: {
    enabled: boolean;
    prompt: string;
    showSkills: boolean;
    showGithub: boolean;
    showBio: boolean;
    customQuestions: CustomQuestion[];
  };
  tier3: {
    enabled: boolean;
    prompt: string;
    customQuestions: CustomQuestion[];
  };
}

interface RegistrationClientProps {
  event: any;
  eventId: string;
  registeredCount: number;
  spotsRemaining: number | null;
  isLoggedIn: boolean;
  userEmail?: string;
  userName?: string;
  formConfig?: FormConfig | null;
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

const experienceLevels = [
  { value: "beginner", label: "Beginner — New to hackathons" },
  { value: "intermediate", label: "Intermediate — A few under my belt" },
  { value: "advanced", label: "Advanced — Seasoned hacker" },
];

export default function RegistrationClient({
  event,
  eventId,
  registeredCount,
  spotsRemaining,
  isLoggedIn,
  userEmail,
  userName,
  formConfig,
}: RegistrationClientProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: userName || "",
    email: userEmail || "",
    password: "",
    skills: [] as string[],
  });

  // Tier 1 fields
  const [experienceLevel, setExperienceLevel] = useState("");

  // Tier 2 fields
  const [github, setGithub] = useState("");
  const [bio, setBio] = useState("");

  // Custom question answers (keyed by question id)
  const [customAnswers, setCustomAnswers] = useState<Record<string, unknown>>({});

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [waitlisted, setWaitlisted] = useState(false);

  const setCustomAnswer = (questionId: string, value: unknown) => {
    setCustomAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

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

    // Validate required custom questions
    if (formConfig) {
      const allCustomQuestions = [
        ...formConfig.tier1.customQuestions,
        ...(formConfig.tier2.enabled ? formConfig.tier2.customQuestions : []),
        ...(formConfig.tier3.enabled ? formConfig.tier3.customQuestions : []),
      ];
      for (const q of allCustomQuestions) {
        if (q.required) {
          const answer = customAnswers[q.id];
          if (!answer || (Array.isArray(answer) && answer.length === 0) || answer === "") {
            setError(`Please answer: "${q.label}"`);
            setIsSubmitting(false);
            return;
          }
        }
      }
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

      // Include form config fields
      if (formConfig) {
        if (formConfig.tier1.showExperienceLevel && experienceLevel) {
          payload.experienceLevel = experienceLevel;
        }
        if (formConfig.tier2.enabled) {
          if (formConfig.tier2.showGithub && github) {
            payload.github = github;
          }
          if (formConfig.tier2.showBio && bio) {
            payload.bio = bio;
          }
        }
        // Include all custom answers
        if (Object.keys(customAnswers).length > 0) {
          payload.customAnswers = customAnswers;
        }
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

  const handleJoinWaitlist = async () => {
    setIsJoiningWaitlist(true);
    setError("");

    try {
      const response = await fetch(`/api/events/${eventId}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name || userName || "",
          email: formData.email || userEmail || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join waitlist");
      }

      setWaitlisted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to join waitlist";
      setError(message);
    } finally {
      setIsJoiningWaitlist(false);
    }
  };

  // Render a custom question field
  const renderCustomQuestion = (question: CustomQuestion) => {
    const value = customAnswers[question.id];

    switch (question.type) {
      case "text":
        return (
          <Grid size={{ xs: 12 }} key={question.id}>
            <TextField
              fullWidth
              required={question.required}
              label={question.label}
              placeholder={question.placeholder}
              value={(value as string) || ""}
              onChange={(e) => setCustomAnswer(question.id, e.target.value)}
            />
          </Grid>
        );

      case "select":
        return (
          <Grid size={{ xs: 12 }} key={question.id}>
            <TextField
              fullWidth
              select
              required={question.required}
              label={question.label}
              value={(value as string) || ""}
              onChange={(e) => setCustomAnswer(question.id, e.target.value)}
            >
              {question.options.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        );

      case "multiselect":
        return (
          <Grid size={{ xs: 12 }} key={question.id}>
            <Autocomplete
              multiple
              options={question.options}
              value={(value as string[]) || []}
              onChange={(_, newValue) => setCustomAnswer(question.id, newValue)}
              renderTags={(vals, getTagProps) =>
                vals.map((opt, index) => (
                  <Chip label={opt} {...getTagProps({ index })} key={opt} size="small" />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={question.label}
                  placeholder={question.placeholder}
                  required={question.required && (!value || (value as string[]).length === 0)}
                />
              )}
            />
          </Grid>
        );

      case "checkbox":
        return (
          <Grid size={{ xs: 12 }} key={question.id}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!value}
                  onChange={(e) => setCustomAnswer(question.id, e.target.checked)}
                  required={question.required}
                />
              }
              label={question.label}
            />
          </Grid>
        );

      default:
        return null;
    }
  };

  if (waitlisted) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <EventIcon sx={{ fontSize: 80, color: "warning.main" }} />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            You're on the Waitlist!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {event.name} is at full capacity. We'll notify you if a spot opens up.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => router.push("/events")}
          >
            Browse Other Events
          </Button>
        </Box>
      </Container>
    );
  }

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

  // Gather all custom questions by tier for rendering
  const tier1Questions = formConfig?.tier1.customQuestions || [];
  const tier2Questions = formConfig?.tier2.enabled ? formConfig.tier2.customQuestions : [];
  const tier3Questions = formConfig?.tier3.enabled ? formConfig.tier3.customQuestions : [];
  const hasTier1Extras = formConfig && (formConfig.tier1.showExperienceLevel || tier1Questions.length > 0);
  const hasTier2 = formConfig?.tier2.enabled && (formConfig.tier2.showSkills || formConfig.tier2.showGithub || formConfig.tier2.showBio || tier2Questions.length > 0);
  const hasTier3 = formConfig?.tier3.enabled && tier3Questions.length > 0;

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

      {/* Waitlist Card — shown when at capacity */}
      {spotsRemaining !== null && spotsRemaining <= 0 && (
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Event is at Full Capacity
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              All {event.capacity} spots have been filled. Join the waitlist to be notified if a spot opens up.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {!isLoggedIn && (
              <Grid container spacing={2} sx={{ mb: 2, textAlign: "left" }}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    required
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    required
                    type="email"
                    label="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Grid>
              </Grid>
            )}

            <Button
              variant="contained"
              color="warning"
              size="large"
              fullWidth
              onClick={handleJoinWaitlist}
              disabled={isJoiningWaitlist || (!isLoggedIn && (!formData.name || !formData.email))}
              sx={{ py: 1.5 }}
            >
              {isJoiningWaitlist ? "Joining Waitlist..." : "Join Waitlist"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Registration Form — hidden when at capacity */}
      {(spotsRemaining === null || spotsRemaining > 0) && (
      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            {formConfig ? formConfig.name : "Quick Registration"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {formConfig
              ? "Fill out the form below to register for this event."
              : "Just the essentials — you can complete your profile later."}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              {/* === Core Fields (always shown) === */}

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

              {/* === Tier 1: Experience Level + Custom Questions === */}
              {hasTier1Extras && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 0.5 }} />
                  </Grid>

                  {formConfig!.tier1.showExperienceLevel && (
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        select
                        label="Experience Level"
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                      >
                        {experienceLevels.map((level) => (
                          <MenuItem key={level.value} value={level.value}>
                            {level.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  )}

                  {tier1Questions.map(renderCustomQuestion)}
                </>
              )}

              {/* === Tier 2: Skills, GitHub, Bio + Custom Questions === */}
              {hasTier2 && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 0.5 }} />
                    {formConfig!.tier2.prompt && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {formConfig!.tier2.prompt}
                      </Typography>
                    )}
                  </Grid>

                  {formConfig!.tier2.showGithub && (
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="GitHub Username"
                        placeholder="e.g. octocat"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <GitHubIcon sx={{ color: "action.active" }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  )}

                  {formConfig!.tier2.showBio && (
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Short Bio"
                        placeholder="Tell us a bit about yourself and what you want to build..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </Grid>
                  )}

                  {tier2Questions.map(renderCustomQuestion)}
                </>
              )}

              {/* Skills — show always (core field), but respect tier2.showSkills if form config exists */}
              {(!formConfig || !formConfig.tier2.enabled || formConfig.tier2.showSkills) && (
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
              )}

              {/* === Tier 3: Additional Questions === */}
              {hasTier3 && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 0.5 }} />
                    {formConfig!.tier3.prompt && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {formConfig!.tier3.prompt}
                      </Typography>
                    )}
                  </Grid>

                  {tier3Questions.map(renderCustomQuestion)}
                </>
              )}

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
      )}
    </Container>
  );
}
