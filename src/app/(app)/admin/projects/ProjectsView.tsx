"use client";

import { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Card,
  CardContent,
  Typography,
  Grid,
  Link as MuiLink,
  CardActions,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Code as CodeIcon,
  Launch as LaunchIcon,
  GitHub as GitHubIcon,
  Description as DocsIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from "@mui/icons-material";
import ViewToggle from "@/components/shared-ui/ViewToggle";
import ExportButton from "@/components/shared-ui/ExportButton";

interface Project {
  _id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  technologies: string[];
  repoUrl: string;
  demoUrl?: string;
  documentationUrl?: string;
  featured?: boolean;
  createdAt: string;
  eventId?: string;
  teamId?: string;
}

const statusColors: Record<string, "default" | "success" | "info" | "warning" | "error"> = {
  draft: "default",
  submitted: "info",
  under_review: "warning",
  judged: "success",
};

export default function ProjectsView({ projects }: { projects: Project[] }) {
  const [view, setView] = useState<"table" | "card">("table");
  const [featuredMap, setFeaturedMap] = useState<Record<string, boolean>>(
    () => {
      const map: Record<string, boolean> = {};
      projects.forEach((p) => {
        map[p._id] = !!p.featured;
      });
      return map;
    }
  );

  const toggleFeatured = async (projectId: string) => {
    const newVal = !featuredMap[projectId];
    setFeaturedMap((prev) => ({ ...prev, [projectId]: newVal }));
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/featured`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: newVal }),
      });
      if (!res.ok) {
        setFeaturedMap((prev) => ({ ...prev, [projectId]: !newVal }));
      }
    } catch {
      setFeaturedMap((prev) => ({ ...prev, [projectId]: !newVal }));
    }
  };

  // CSV export columns
  const csvColumns = [
    { key: "name" as const, label: "Project Name" },
    { key: "category" as const, label: "Category" },
    { key: "status" as const, label: "Status" },
    { key: "technologies" as const, label: "Technologies" },
    { key: "repoUrl" as const, label: "GitHub URL" },
    { key: "demoUrl" as const, label: "Demo URL" },
    { key: "documentationUrl" as const, label: "Docs URL" },
    { key: "createdAt" as const, label: "Submitted" },
  ];

  // Transform data for CSV
  const csvData = projects.map((project) => ({
    ...project,
    technologies: project.technologies?.join("; ") || "",
    createdAt: new Date(project.createdAt).toLocaleDateString(),
  }));

  if (projects.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          No projects submitted yet. Projects will appear here once teams submit their work.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <ViewToggle view={view} onChange={setView} />
        <ExportButton data={csvData} filename="projects" columns={csvColumns} />
      </Box>

      {/* Table View */}
      {view === "table" && (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Featured</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Project Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Technologies</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Links</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Submitted</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project._id} hover>
                  <TableCell>
                    <Tooltip title={featuredMap[project._id] ? "Remove from gallery" : "Feature in gallery"}>
                      <IconButton
                        size="small"
                        onClick={() => toggleFeatured(project._id)}
                        sx={{
                          color: featuredMap[project._id] ? "#FFC010" : "text.disabled",
                        }}
                      >
                        {featuredMap[project._id] ? <StarIcon /> : <StarBorderIcon />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{project.name}</TableCell>
                  <TableCell>{project.category || "Uncategorized"}</TableCell>
                  <TableCell>
                    <Chip
                      label={project.status.replace("_", " ")}
                      size="small"
                      color={statusColors[project.status] || "default"}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {project.technologies?.slice(0, 3).map((tech) => (
                        <Chip key={tech} label={tech} size="small" variant="outlined" />
                      ))}
                      {(project.technologies?.length || 0) > 3 && (
                        <Chip
                          label={`+${(project.technologies?.length || 0) - 3}`}
                          size="small"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <MuiLink href={project.repoUrl} target="_blank" rel="noopener">
                        <GitHubIcon fontSize="small" />
                      </MuiLink>
                      {project.demoUrl && (
                        <MuiLink href={project.demoUrl} target="_blank" rel="noopener">
                          <LaunchIcon fontSize="small" />
                        </MuiLink>
                      )}
                      {project.documentationUrl && (
                        <MuiLink href={project.documentationUrl} target="_blank" rel="noopener">
                          <DocsIcon fontSize="small" />
                        </MuiLink>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{new Date(project.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Card View */}
      {view === "card" && (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid key={project._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <CodeIcon sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {project.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {project.category || "Uncategorized"}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description?.substring(0, 120)}
                    {(project.description?.length || 0) > 120 && "..."}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                      Tech Stack:
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {project.technologies?.map((tech) => (
                        <Chip key={tech} label={tech} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>

                  <Chip
                    label={project.status.replace("_", " ")}
                    size="small"
                    color={statusColors[project.status] || "default"}
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="caption" color="text.secondary" display="block">
                    Submitted: {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Tooltip title={featuredMap[project._id] ? "Remove from gallery" : "Feature in gallery"}>
                    <IconButton
                      size="small"
                      onClick={() => toggleFeatured(project._id)}
                      sx={{
                        color: featuredMap[project._id] ? "#FFC010" : "text.disabled",
                      }}
                    >
                      {featuredMap[project._id] ? <StarIcon /> : <StarBorderIcon />}
                    </IconButton>
                  </Tooltip>
                  <Button
                    size="small"
                    startIcon={<GitHubIcon />}
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener"
                  >
                    GitHub
                  </Button>
                  {project.demoUrl && (
                    <Button
                      size="small"
                      startIcon={<LaunchIcon />}
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener"
                    >
                      Demo
                    </Button>
                  )}
                  {project.documentationUrl && (
                    <Button
                      size="small"
                      startIcon={<DocsIcon />}
                      href={project.documentationUrl}
                      target="_blank"
                      rel="noopener"
                    >
                      Docs
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
