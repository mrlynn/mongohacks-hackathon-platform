"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Slider,
  TextField,
  Chip,
  Grid,
  Alert,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  GitHub as GitHubIcon,
  Launch as LaunchIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";

interface RubricCriterion {
  name: string;
  description: string;
  weight: number;
  maxScore: number;
}

interface ProjectScoringClientProps {
  event: {
    name: string;
    judgingRubric?: RubricCriterion[];
    [key: string]: unknown;
  };
  project: {
    _id: string;
    name: string;
    description?: string;
    technologies?: string[];
    repoUrl?: string;
    demoUrl?: string;
    videoUrl?: string;
    aiSummary?: string;
    status?: string;
    teamId?: { name: string };
    [key: string]: unknown;
  };
  existingScore: {
    scores?: Record<string, number>;
    comments?: string;
    submittedAt?: string;
  } | null;
  assignment: { _id: string; [key: string]: unknown };
  eventId: string;
  projectId: string;
}

const DEFAULT_CRITERIA: RubricCriterion[] = [
  { name: "innovation", description: "How novel and creative is the solution?", weight: 1, maxScore: 10 },
  { name: "technical", description: "How sophisticated is the implementation?", weight: 1, maxScore: 10 },
  { name: "impact", description: "How valuable is the solution to users?", weight: 1, maxScore: 10 },
  { name: "presentation", description: "How well is the project documented and demoed?", weight: 1, maxScore: 10 },
];

// Convert criterion name to a display label (e.g., "technical_complexity" → "Technical Complexity")
function toLabel(name: string): string {
  return name
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProjectScoringClient({
  event,
  project,
  existingScore,
  assignment,
  eventId,
  projectId,
}: ProjectScoringClientProps) {
  const router = useRouter();

  const criteria = useMemo(
    () =>
      event.judgingRubric && event.judgingRubric.length > 0
        ? event.judgingRubric
        : DEFAULT_CRITERIA,
    [event.judgingRubric]
  );

  // Initialize scores from existing data or defaults (midpoint of each criterion's range)
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const c of criteria) {
      initial[c.name] =
        existingScore?.scores?.[c.name] ?? Math.ceil(c.maxScore / 2);
    }
    return initial;
  });

  const [comments, setComments] = useState(existingScore?.comments || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalScore = criteria.reduce(
    (sum, c) => sum + (scores[c.name] || 0) * c.weight,
    0
  );
  const maxScore = criteria.reduce(
    (sum, c) => sum + c.maxScore * c.weight,
    0
  );

  const handleScoreChange = (criterion: string, value: number | number[]) => {
    setScores((prev) => ({ ...prev, [criterion]: value as number }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/judging/${eventId}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          scores,
          comments,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to submit score");
      }

      setSuccess("Score submitted successfully!");

      // Redirect back to dashboard after 2 seconds
      setTimeout(() => {
        router.push(`/judging/${eventId}`);
      }, 2000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to submit score. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score: number, max: number) => {
    const pct = score / max;
    if (pct >= 0.8) return "success.main";
    if (pct >= 0.6) return "primary.main";
    if (pct >= 0.4) return "warning.main";
    return "error.main";
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      {/* Back Button */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => router.push(`/judging/${eventId}`)}
        sx={{ mb: 3 }}
      >
        Back to Judging Dashboard
      </Button>

      {/* Event Name */}
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        {event.name}
      </Typography>

      {/* Project Header */}
      <Card elevation={2} sx={{ mb: 3, bgcolor: "primary.light" }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, fontSize: { xs: "1.25rem", sm: "2rem" } }}>
                {project.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Team: <strong>{project.teamId?.name || "Unknown"}</strong>
              </Typography>
            </Box>
            {existingScore && (
              <Chip
                icon={<CheckIcon />}
                label="Previously Scored"
                color="success"
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          {/* Description */}
          {project.description && (
            <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
              {project.description}
            </Typography>
          )}

          {/* Technologies */}
          {project.technologies && project.technologies.length > 0 && (
            <Box sx={{ mt: 2, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {project.technologies.map((tech: string) => (
                <Chip key={tech} label={tech} size="small" />
              ))}
            </Box>
          )}

          {/* Links */}
          <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
            {project.repoUrl && (
              <Button
                variant="contained"
                startIcon={<GitHubIcon />}
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View GitHub Repo
              </Button>
            )}
            {project.demoUrl && (
              <Button
                variant="contained"
                startIcon={<LaunchIcon />}
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Live Demo
              </Button>
            )}
            {project.videoUrl && (
              <Button
                variant="contained"
                startIcon={<LaunchIcon />}
                href={project.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch Video
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* AI-Generated Summary */}
      {project.aiSummary && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
            bgcolor: "rgba(0, 237, 100, 0.08)",
            borderLeft: 4,
            borderColor: "#00ED64",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#00684A" }}>
            AI-Generated Summary
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
            {project.aiSummary}
          </Typography>
        </Alert>
      )}

      {/* Summary Generating Message */}
      {!project.aiSummary && project.status === "submitted" && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            AI summary is being generated... This usually takes 10-30 seconds after submission.
            Refresh the page in a moment to see the summary.
          </Typography>
        </Alert>
      )}

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Scoring Form */}
      <Card elevation={2}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
            Score This Project
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Rate each criterion on the scale shown. Take your time to review the project thoroughly before scoring.
          </Typography>

          {/* Criteria Sliders — dynamically rendered */}
          <Grid container spacing={4}>
            {criteria.map((criterion) => {
              const score = scores[criterion.name] || 1;

              return (
                <Grid size={{ xs: 12 }} key={criterion.name}>
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {toLabel(criterion.name)}
                        </Typography>
                        {criterion.weight !== 1 && (
                          <Chip
                            label={`${criterion.weight}x weight`}
                            size="small"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                      <Chip
                        label={`${score} / ${criterion.maxScore}`}
                        sx={{
                          bgcolor: getScoreColor(score, criterion.maxScore),
                          color: "white",
                          fontWeight: 600,
                          fontSize: "1rem",
                          height: 32,
                        }}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {criterion.description}
                    </Typography>

                    <Slider
                      value={score}
                      onChange={(_, value) => handleScoreChange(criterion.name, value)}
                      min={1}
                      max={criterion.maxScore}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                      sx={{
                        "& .MuiSlider-markLabel": {
                          fontSize: "0.75rem",
                        },
                      }}
                    />
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Total Score Display */}
          <Card sx={{ mb: 4, bgcolor: "primary.light" }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Total Score
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 600, color: "primary.main" }}>
                  {totalScore} / {maxScore}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(totalScore / maxScore) * 100}
                sx={{
                  height: 12,
                  borderRadius: 1,
                  bgcolor: "rgba(255,255,255,0.3)",
                }}
              />
            </CardContent>
          </Card>

          {/* Comments */}
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Comments (Optional)"
            placeholder="Share your thoughts on the project's strengths and areas for improvement..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            sx={{ mb: 3 }}
            helperText="Your comments will help the team understand their score and improve their work."
          />

          {/* Submit Button */}
          <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleSubmit}
              disabled={isSubmitting}
              startIcon={isSubmitting ? null : <SaveIcon />}
              sx={{ py: 1.5 }}
            >
              {isSubmitting ? "Submitting..." : existingScore ? "Update Score" : "Submit Score"}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push(`/judging/${eventId}`)}
              disabled={isSubmitting}
              sx={{ flexShrink: 0 }}
            >
              Cancel
            </Button>
          </Box>

          {existingScore && (
            <Alert severity="info" sx={{ mt: 2 }}>
              You previously scored this project on {new Date(existingScore.submittedAt!).toLocaleString()}. Submitting will update your score.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
