"use client";

import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Divider,
  Link as MuiLink,
} from "@mui/material";
import {
  Rocket as RocketIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon,
  GitHub as GitHubIcon,
  Launch as LaunchIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import Link from "next/link";

interface ProjectDetailClientProps {
  project: any;
  team: any;
  event: any;
  isTeamMember: boolean;
  isTeamLeader: boolean;
  eventId: string;
  projectId: string;
}

function getStatusColor(status: string) {
  switch (status) {
    case "submitted":
      return "success";
    case "draft":
      return "warning";
    case "judged":
      return "info";
    default:
      return "default";
  }
}

export default function ProjectDetailClient({
  project,
  team,
  event,
  isTeamMember,
  isTeamLeader,
  eventId,
  projectId,
}: ProjectDetailClientProps) {
  const statusColor = getStatusColor(project.status);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<BackIcon />}
        component={Link}
        href={`/events/${eventId}/hub`}
        sx={{ mb: 3 }}
      >
        Back to Event Hub
      </Button>

      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3 }}>
            <RocketIcon sx={{ fontSize: 40, color: "secondary.main" }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {project.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {event.name}
              </Typography>
            </Box>
            <Chip
              label={project.status}
              color={statusColor as any}
              sx={{ textTransform: "capitalize" }}
            />
          </Box>

          {/* Team */}
          {team && (
            <Box sx={{ mb: 3, p: 2, bgcolor: "primary.50", borderRadius: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <PeopleIcon color="primary" />
              <Typography variant="body1">
                Team: <strong>{team.name}</strong>
              </Typography>
            </Box>
          )}

          {/* Description */}
          {project.description && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Description
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {project.description}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Details Grid */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {project.category && (
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Category
                </Typography>
                <Chip label={project.category} color="primary" sx={{ mt: 1 }} />
              </Grid>
            )}

            {project.track && (
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Track
                </Typography>
                <Chip label={project.track} color="secondary" sx={{ mt: 1 }} />
              </Grid>
            )}

            {project.technologies && project.technologies.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Technologies Used
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {project.technologies.map((tech: string) => (
                    <Chip key={tech} label={tech} size="small" variant="outlined" />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Links */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Project Links
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            {project.repoUrl && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <GitHubIcon color="action" />
                <MuiLink
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  GitHub Repository
                  <LaunchIcon sx={{ fontSize: 16 }} />
                </MuiLink>
              </Box>
            )}

            {project.demoUrl && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LaunchIcon color="action" />
                <MuiLink
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  Live Demo
                  <LaunchIcon sx={{ fontSize: 16 }} />
                </MuiLink>
              </Box>
            )}

            {project.videoUrl && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LaunchIcon color="action" />
                <MuiLink
                  href={project.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  Demo Video
                  <LaunchIcon sx={{ fontSize: 16 }} />
                </MuiLink>
              </Box>
            )}

            {!project.repoUrl && !project.demoUrl && !project.videoUrl && (
              <Typography variant="body2" color="text.secondary">
                No links provided yet
              </Typography>
            )}
          </Box>

          {/* Submission Info */}
          {project.submittedAt && (
            <Box sx={{ p: 2, bgcolor: "success.50", borderRadius: 1, mb: 3 }}>
              <Typography variant="body2" color="success.dark">
                Submitted on {new Date(project.submittedAt).toLocaleString()}
              </Typography>
            </Box>
          )}

          {/* Actions */}
          {isTeamMember && (
            <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                component={Link}
                href={`/events/${eventId}/projects/${projectId}/edit`}
              >
                Edit Project
              </Button>

              {project.status === "draft" && (
                <Button variant="outlined" color="success">
                  Submit for Judging
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
