"use client";

import { Card, CardContent, Box, Typography, Chip, Button, Link as MuiLink } from "@mui/material";
import {
  Rocket as RocketIcon,
  GitHub as GitHubIcon,
  Launch as LaunchIcon,
  Description as DocsIcon,
  Edit as EditIcon,
  Send as SubmitIcon,
} from "@mui/icons-material";
import Link from "next/link";

interface YourProjectSectionProps {
  project: any;
  team: any;
  eventId: string;
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

function getStatusLabel(status: string) {
  switch (status) {
    case "submitted":
      return "Submitted";
    case "draft":
      return "Draft (Not Submitted)";
    case "judged":
      return "Judged";
    default:
      return status;
  }
}

export default function YourProjectSection({
  project,
  team,
  eventId,
}: YourProjectSectionProps) {
  const statusColor = getStatusColor(project.status);
  const statusLabel = getStatusLabel(project.status);
  const isDraft = project.status === "draft";

  return (
    <Card elevation={2} id="your-project">
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3 }}>
          <RocketIcon sx={{ fontSize: 32, color: "secondary.main" }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              Your Project
            </Typography>
            <Typography variant="h6" sx={{ color: "text.secondary" }}>
              {project.name}
            </Typography>
          </Box>
          <Chip
            label={statusLabel}
            color={statusColor as any}
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* Team */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Team:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {team.name}
          </Typography>
        </Box>

        {/* Description */}
        {project.description && (
          <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="body2">{project.description}</Typography>
          </Box>
        )}

        {/* Category & Tech Stack */}
        <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
          {project.category && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                Category:
              </Typography>
              <Chip label={project.category} size="small" color="primary" />
            </Box>
          )}
          {project.technologies && project.technologies.length > 0 && (
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                Tech Stack:
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {project.technologies.map((tech: string) => (
                  <Chip key={tech} label={tech} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Links */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Project Links:
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {project.repoUrl && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <GitHubIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                <MuiLink
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  <Typography variant="body2">GitHub Repository</Typography>
                  <LaunchIcon sx={{ fontSize: 14 }} />
                </MuiLink>
              </Box>
            )}
            {project.demoUrl && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LaunchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                <MuiLink
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  <Typography variant="body2">Live Demo</Typography>
                  <LaunchIcon sx={{ fontSize: 14 }} />
                </MuiLink>
              </Box>
            )}
            {project.docsUrl && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <DocsIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                <MuiLink
                  href={project.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  <Typography variant="body2">Documentation</Typography>
                  <LaunchIcon sx={{ fontSize: 14 }} />
                </MuiLink>
              </Box>
            )}
            {!project.repoUrl && !project.demoUrl && !project.docsUrl && (
              <Typography variant="body2" color="text.secondary">
                No links provided yet
              </Typography>
            )}
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            component={Link}
            href={`/events/${eventId}/projects/${project._id}/edit`}
          >
            Edit Project
          </Button>
          {isDraft && (
            <Button
              variant="contained"
              color="success"
              startIcon={<SubmitIcon />}
            >
              Submit for Judging
            </Button>
          )}
          <Button
            variant="outlined"
            component={Link}
            href={`/events/${eventId}/projects/${project._id}`}
          >
            View Full Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
