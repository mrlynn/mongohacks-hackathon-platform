"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Button,
  Link as MuiLink,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Rocket as RocketIcon,
  GitHub as GitHubIcon,
  Launch as LaunchIcon,
  Description as DocsIcon,
  Edit as EditIcon,
  Send as SubmitIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";

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
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: project.name || "",
    description: project.description || "",
    githubUrl: project.githubUrl || "",
    demoUrl: project.demoUrl || "",
  });

  const statusColor = getStatusColor(project.status);
  const statusLabel = getStatusLabel(project.status);
  const isDraft = project.status === "draft";

  const copyProjectLink = async () => {
    const projectLink = `${window.location.origin}/events/${eventId}/projects/${project._id}`;
    try {
      await navigator.clipboard.writeText(projectLink);
      showSuccess('Project link copied to clipboard! 📋');
    } catch (err) {
      showError('Failed to copy project link');
    }
  };

  const shareProject = async () => {
    const projectLink = `${window.location.origin}/events/${eventId}/projects/${project._id}`;
    const shareText = `Check out our hackathon project "${project.name}"!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.name,
          text: shareText,
          url: projectLink,
        });
        showSuccess('Project shared successfully! 🎉');
      } catch (err) {
        // User cancelled share
      }
    } else {
      copyProjectLink();
    }
  };

  const handleQuickEdit = () => {
    setEditForm({
      name: project.name || "",
      description: project.description || "",
      githubUrl: project.githubUrl || "",
      demoUrl: project.demoUrl || "",
    });
    setEditDialogOpen(true);
  };

  const handleSaveQuickEdit = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/events/${eventId}/projects/${project._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      showSuccess('Project updated successfully! ✅');
      setEditDialogOpen(false);
      router.refresh();
    } catch (err) {
      showError('Failed to update project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitProject = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/events/${eventId}/projects/${project._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit project');
      }

      showSuccess(data.message || 'Project submitted successfully! 🎉');
      router.refresh();
    } catch (err: any) {
      showError(err.message || 'Failed to submit project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnsubmitProject = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/events/${eventId}/projects/${project._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unsubmit' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unsubmit project');
      }

      showSuccess(data.message || 'Project unsubmitted. You can now make changes.');
      router.refresh();
    } catch (err: any) {
      showError(err.message || 'Failed to unsubmit project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleQuickEdit}
          >
            Quick Edit
          </Button>
          {isDraft && (
            <Button
              variant="contained"
              color="success"
              startIcon={<SubmitIcon />}
              onClick={handleSubmitProject}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Judging'}
            </Button>
          )}
          {project.status === 'submitted' && (
            <Button
              variant="outlined"
              color="warning"
              onClick={handleUnsubmitProject}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Unsubmitting...' : 'Unsubmit Project'}
            </Button>
          )}
          
          {/* Quick Actions */}
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Copy project link">
              <IconButton size="small" onClick={copyProjectLink} color="primary">
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share project">
              <IconButton size="small" onClick={shareProject} color="primary">
                <ShareIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Button
            variant="outlined"
            component={Link}
            href={`/events/${eventId}/projects/${project._id}`}
          >
            View Full Details
          </Button>
        </Box>
      </CardContent>

      {/* Quick Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Quick Edit Project</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Project Name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="GitHub URL"
              value={editForm.githubUrl}
              onChange={(e) => setEditForm({ ...editForm, githubUrl: e.target.value })}
              fullWidth
              placeholder="https://github.com/..."
            />
            <TextField
              label="Demo URL"
              value={editForm.demoUrl}
              onChange={(e) => setEditForm({ ...editForm, demoUrl: e.target.value })}
              fullWidth
              placeholder="https://..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveQuickEdit}
            disabled={isSaving || !editForm.name.trim()}
            startIcon={isSaving ? <CircularProgress size={16} /> : undefined}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
