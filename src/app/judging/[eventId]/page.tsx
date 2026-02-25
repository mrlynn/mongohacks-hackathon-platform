"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Slider,
  Chip,
  Alert,
  CircularProgress,
  Link as MuiLink,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  GitHub as GitHubIcon,
  Launch as LaunchIcon,
  Description as DocsIcon,
  CheckCircle as CheckCircleIcon,
  Code as CodeIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface Project {
  _id: string;
  name: string;
  description: string;
  category: string;
  technologies: string[];
  repoUrl: string;
  demoUrl?: string;
  documentationUrl?: string;
  innovations: string;
  submissionDate: string;
  team: {
    _id: string;
    name: string;
    memberCount: number;
  } | null;
  teamMembers: Array<{ _id: string; name: string; email: string }>;
  hasScored: boolean;
  myScore: {
    innovation: number;
    technical: number;
    impact: number;
    presentation: number;
    totalScore: number;
    comments: string;
  } | null;
}

export default function JudgingPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const router = useRouter();
  const [eventId, setEventId] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [scoring, setScoring] = useState(false);
  const [success, setSuccess] = useState("");

  const [scores, setScores] = useState({
    innovation: 5,
    technical: 5,
    impact: 5,
    presentation: 5,
    comments: "",
  });

  useEffect(() => {
    params.then((p) => {
      setEventId(p.eventId);
      fetchProjects(p.eventId);
    });
  }, []);

  const fetchProjects = async (id: string) => {
    try {
      const res = await fetch(`/api/judging/${id}/projects`);
      const data = await res.json();

      if (res.ok) {
        setProjects(data.projects || []);
      } else {
        setError(data.error || "Failed to load projects");
      }
    } catch (err) {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenScoreDialog = (project: Project) => {
    setSelectedProject(project);
    if (project.myScore) {
      // Load existing scores
      setScores({
        innovation: project.myScore.innovation,
        technical: project.myScore.technical,
        impact: project.myScore.impact,
        presentation: project.myScore.presentation,
        comments: project.myScore.comments,
      });
    } else {
      // Reset to defaults
      setScores({
        innovation: 5,
        technical: 5,
        impact: 5,
        presentation: 5,
        comments: "",
      });
    }
  };

  const handleCloseScoreDialog = () => {
    setSelectedProject(null);
    setSuccess("");
  };

  const handleSubmitScore = async () => {
    if (!selectedProject) return;

    setScoring(true);
    setError("");

    try {
      const res = await fetch(`/api/judging/${eventId}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject._id,
          ...scores,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Score submitted successfully!");
        // Refresh projects to show updated score
        await fetchProjects(eventId);
        setTimeout(() => {
          handleCloseScoreDialog();
        }, 1500);
      } else {
        setError(data.message || "Failed to submit score");
      }
    } catch (err) {
      setError("Failed to submit score");
    } finally {
      setScoring(false);
    }
  };

  const getTotalScore = () => {
    return scores.innovation + scores.technical + scores.impact + scores.presentation;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
        Judging Panel
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Review and score submitted projects
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {projects.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 8, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              No projects submitted yet
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} key={project._id}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        {project.name}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                        <Chip label={project.category} size="small" />
                        {project.team && (
                          <Chip
                            label={`Team: ${project.team.name}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {project.hasScored && (
                          <Chip
                            label={`Scored: ${project.myScore?.totalScore}/40`}
                            size="small"
                            color="success"
                            icon={<CheckCircleIcon />}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {project.description}
                  </Typography>

                  {project.innovations && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Innovations:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {project.innovations}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                    {project.technologies.map((tech) => (
                      <Chip key={tech} label={tech} size="small" variant="outlined" />
                    ))}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<GitHubIcon />}
                      component="a"
                      href={project.repoUrl}
                      target="_blank"
                    >
                      GitHub Repo
                    </Button>
                    {project.demoUrl && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<LaunchIcon />}
                        component="a"
                        href={project.demoUrl}
                        target="_blank"
                      >
                        Live Demo
                      </Button>
                    )}
                    {project.documentationUrl && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DocsIcon />}
                        component="a"
                        href={project.documentationUrl}
                        target="_blank"
                      >
                        Documentation
                      </Button>
                    )}
                  </Box>

                  <Button
                    variant="contained"
                    onClick={() => handleOpenScoreDialog(project)}
                  >
                    {project.hasScored ? "Update Score" : "Score Project"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Scoring Dialog */}
      <Dialog
        open={!!selectedProject}
        onClose={handleCloseScoreDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Score: {selectedProject?.name}
        </DialogTitle>
        <DialogContent>
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            {/* Innovation */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Innovation (1-10)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
                How creative and original is the solution?
              </Typography>
              <Slider
                value={scores.innovation}
                onChange={(_, value) => setScores({ ...scores, innovation: value as number })}
                min={1}
                max={10}
                marks
                valueLabelDisplay="on"
              />
            </Box>

            {/* Technical */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Technical Complexity (1-10)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
                How technically challenging and well-executed?
              </Typography>
              <Slider
                value={scores.technical}
                onChange={(_, value) => setScores({ ...scores, technical: value as number })}
                min={1}
                max={10}
                marks
                valueLabelDisplay="on"
              />
            </Box>

            {/* Impact */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Impact (1-10)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
                How useful and impactful is this solution?
              </Typography>
              <Slider
                value={scores.impact}
                onChange={(_, value) => setScores({ ...scores, impact: value as number })}
                min={1}
                max={10}
                marks
                valueLabelDisplay="on"
              />
            </Box>

            {/* Presentation */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Presentation (1-10)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
                Quality of demo, documentation, and overall presentation
              </Typography>
              <Slider
                value={scores.presentation}
                onChange={(_, value) => setScores({ ...scores, presentation: value as number })}
                min={1}
                max={10}
                marks
                valueLabelDisplay="on"
              />
            </Box>

            {/* Total Score */}
            <Box sx={{ mb: 4, p: 2, bgcolor: "primary.50", borderRadius: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Total Score: {getTotalScore()} / 40
              </Typography>
            </Box>

            {/* Comments */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comments (Optional)"
              value={scores.comments}
              onChange={(e) => setScores({ ...scores, comments: e.target.value })}
              placeholder="Provide feedback for the team..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseScoreDialog} disabled={scoring}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitScore}
            variant="contained"
            disabled={scoring}
          >
            {scoring ? "Submitting..." : "Submit Score"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
