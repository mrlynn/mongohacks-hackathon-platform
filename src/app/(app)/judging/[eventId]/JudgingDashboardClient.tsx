"use client";

import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Alert,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Gavel as GavelIcon,
  GitHub as GitHubIcon,
  Launch as LaunchIcon,
  AutoAwesome as AIIcon,
} from "@mui/icons-material";

interface Assignment {
  _id: string;
  projectId: {
    _id: string;
    name: string;
    description: string;
    aiSummary?: string;
    repoUrl?: string;
    demoUrl?: string;
    videoUrl?: string;
    technologies?: string[];
    teamId: {
      _id: string;
      name: string;
    };
  };
  status: string;
  hasScore: boolean;
  score: any;
}

interface JudgingDashboardClientProps {
  event: any;
  assignments: Assignment[];
  eventId: string;
}

export default function JudgingDashboardClient({
  event,
  assignments,
  eventId,
}: JudgingDashboardClientProps) {
  const router = useRouter();

  const scoredCount = assignments.filter((a) => a.hasScore).length;
  const totalCount = assignments.length;
  const progress = totalCount > 0 ? Math.round((scoredCount / totalCount) * 100) : 0;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, fontSize: { xs: "1.25rem", sm: "2rem" } }}>
          <GavelIcon sx={{ mr: 1, verticalAlign: "middle", fontSize: { xs: 28, sm: 36 } }} />
          Judging: {event.name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You have {totalCount} project{totalCount !== 1 ? "s" : ""} to judge
        </Typography>
      </Box>

      {/* Progress */}
      <Card sx={{ mb: 4, bgcolor: "primary.light" }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Your Progress
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: "primary.main" }}>
              {scoredCount} / {totalCount}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 12,
              borderRadius: 1,
              bgcolor: "rgba(255,255,255,0.3)",
              "& .MuiLinearProgress-bar": {
                bgcolor: progress === 100 ? "success.main" : "primary.main",
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            {progress}% complete
            {progress === 100 && " - All projects scored! 🎉"}
          </Typography>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          How to Judge:
        </Typography>
        <Typography variant="body2" component="div">
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Click "Score Project" on any project card below</li>
            <li>Review the project details, GitHub repo, and demo</li>
            <li>Rate each criterion on a scale of 1-10</li>
            <li>Add comments (optional but encouraged)</li>
            <li>Submit your scores</li>
          </ol>
        </Typography>
      </Alert>

      {/* Project Cards */}
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Assigned Projects
      </Typography>

      <Grid container spacing={3}>
        {assignments.map((assignment) => {
          const project = assignment.projectId;
          const isScored = assignment.hasScore;

          return (
            <Grid size={{ xs: 12, md: 6 }} key={assignment._id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  border: 2,
                  borderColor: isScored ? "success.main" : "divider",
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* Header with Status */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                      {project.name}
                    </Typography>
                    {isScored ? (
                      <Chip
                        icon={<CheckIcon />}
                        label="Scored"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<UncheckedIcon />}
                        label="Pending"
                        color="default"
                        size="small"
                      />
                    )}
                  </Box>

                  {/* Team */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Team: <strong>{project.teamId?.name || "Unknown"}</strong>
                  </Typography>

                  {/* AI Summary (shown when available, otherwise fall back to description) */}
                  {project.aiSummary ? (
                    <Box
                      sx={{
                        mb: 2,
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: "primary.50",
                        border: "1px solid",
                        borderColor: "primary.100",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                        <AIIcon sx={{ fontSize: 14, color: "primary.main" }} />
                        <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                          AI Summary
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.primary" sx={{ fontStyle: "italic" }}>
                        {project.aiSummary}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {project.description || "No description provided"}
                    </Typography>
                  )}

                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <Box sx={{ mb: 2, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {project.technologies.slice(0, 4).map((tech) => (
                        <Chip key={tech} label={tech} size="small" variant="outlined" />
                      ))}
                      {project.technologies.length > 4 && (
                        <Chip label={`+${project.technologies.length - 4}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  )}

                  {/* Links */}
                  <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {project.repoUrl && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<GitHubIcon />}
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Repo
                      </Button>
                    )}
                    {project.demoUrl && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<LaunchIcon />}
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Demo
                      </Button>
                    )}
                    {project.videoUrl && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<LaunchIcon />}
                        href={project.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Video
                      </Button>
                    )}
                  </Box>

                  {/* Score Summary (if scored) */}
                  {isScored && assignment.score && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Your Score: {assignment.score.totalScore}/40
                      </Typography>
                    </Alert>
                  )}

                  {/* Action Button */}
                  <Button
                    variant={isScored ? "outlined" : "contained"}
                    color={isScored ? "success" : "primary"}
                    fullWidth
                    size="large"
                    onClick={() => router.push(`/judging/${eventId}/${project._id}`)}
                    sx={{ mt: "auto" }}
                  >
                    {isScored ? "View/Edit Score" : "Score Project"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Completion Message */}
      {progress === 100 && (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="h5" color="success.main" sx={{ fontWeight: 600, mb: 1 }}>
            🎉 All Projects Scored!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Thank you for your time and expertise. Your scores have been submitted.
          </Typography>
        </Box>
      )}
    </Container>
  );
}
