import { Box, Typography, Chip } from "@mui/material";
import { connectToDatabase } from "@/lib/db/connection";
import { ProjectModel } from "@/lib/db/models/Project";
import ProjectsView from "./ProjectsView";

async function getProjects() {
  await connectToDatabase();
  const projects = await ProjectModel.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return projects.map((project) => ({
    ...project,
    _id: project._id.toString(),
    eventId: project.eventId?.toString(),
    teamId: project.teamId?.toString(),
    technologies: project.technologies || [],
    createdAt: project.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: project.updatedAt?.toISOString() || new Date().toISOString(),
  }));
}

const statusColors: Record<string, "default" | "success" | "info" | "warning" | "error"> = {
  draft: "default",
  submitted: "info",
  under_review: "warning",
  judged: "success",
};

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  const stats = {
    total: projects.length,
    draft: projects.filter((p) => p.status === "draft").length,
    submitted: projects.filter((p) => p.status === "submitted").length,
    underReview: projects.filter((p) => p.status === "under_review").length,
    judged: projects.filter((p) => p.status === "judged").length,
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Projects Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all submitted projects
        </Typography>
      </Box>

      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Chip label={`${stats.total} Total Projects`} />
        <Chip label={`${stats.submitted} Submitted`} color="info" variant="outlined" />
        <Chip label={`${stats.underReview} Under Review`} color="warning" variant="outlined" />
        <Chip label={`${stats.judged} Judged`} color="success" variant="outlined" />
      </Box>

      <ProjectsView projects={projects} />
    </Box>
  );
}
