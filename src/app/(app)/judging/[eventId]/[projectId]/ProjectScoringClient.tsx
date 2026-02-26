"use client";

import { useState } from "react";
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

interface ProjectScoringClientProps {
  event: any;
  project: any;
  existingScore: any;
  assignment: any;
  eventId: string;
  projectId: string;
}

const criteria = [
  {
    key: "innovation",
    label: "Innovation",
    description: "How novel and creative is the solution?",
  },
  {
    key: "technical",
    label: "Technical Complexity",
    description: "How sophisticated is the implementation?",
  },
  {
    key: "impact",
    label: "Impact",
    description: "How valuable is the solution to users?",
  },
  {
    key: "presentation",
    label: "Presentation",
    description: "How well is the project documented and demoed?",
  },
];

export default function ProjectScoringClient({
  event,
  project,
  existingScore,
  assignment,
  eventId,
  projectId,
}: ProjectScoringClientProps) {
  const router = useRouter();
  
  const [scores, setScores] = useState({
    innovation: existingScore?.scores?.innovation || 5,
    technical: existingScore?.scores?.technical || 5,
    impact: existingScore?.scores?.impact || 5,
    presentation: existingScore?.scores?.presentation || 5,
  });
  
  const [comments, setComments] = useState(existingScore?.comments || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const maxScore = 40;

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
          ...scores,
          comments,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to submit score");
      }

      setSuccess("Score submitted successfully! 🎉");
      
      // Redirect back to dashboard after 2 seconds
      setTimeout(() => {
        router.push(`/judging/${eventId}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to submit score. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "success.main";
    if (score >= 6) return "primary.main";
    if (score >= 4) return "warning.main";
    return "error.main";
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
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
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            Score This Project
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Rate each criterion on a scale from 1 (lowest) to 10 (highest). Take your time to review the project thoroughly before scoring.
          </Typography>

          {/* Criteria Sliders */}
          <Grid container spacing={4}>
            {criteria.map((criterion) => {
              const score = scores[criterion.key as keyof typeof scores];
              
              return (
                <Grid size={{ xs: 12 }} key={criterion.key}>
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {criterion.label}
                      </Typography>
                      <Chip
                        label={`${score} / 10`}
                        sx={{
                          bgcolor: getScoreColor(score),
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
                      onChange={(_, value) => handleScoreChange(criterion.key, value)}
                      min={1}
                      max={10}
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
          <Box sx={{ display: "flex", gap: 2 }}>
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
            >
              Cancel
            </Button>
          </Box>

          {existingScore && (
            <Alert severity="info" sx={{ mt: 2 }}>
              You previously scored this project on {new Date(existingScore.submittedAt).toLocaleString()}. Submitting will update your score.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
