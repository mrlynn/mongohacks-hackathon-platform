import { Box, Typography, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { connectToDatabase } from "@/lib/db/connection";
import { ProjectModel } from "@/lib/db/models/Project";

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
    createdAt: project.createdAt?.toISOString() || new Date().toISOString(),
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

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell sx={{ fontWeight: 600 }}>Project Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Technologies</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Submitted</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No projects submitted yet
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project._id} hover>
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
                      {project.technologies?.slice(0, 3).map((tech: string) => (
                        <Chip key={tech} label={tech} size="small" variant="outlined" />
                      ))}
                      {(project.technologies?.length || 0) > 3 && (
                        <Chip label={`+${(project.technologies?.length || 0) - 3}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(project.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
