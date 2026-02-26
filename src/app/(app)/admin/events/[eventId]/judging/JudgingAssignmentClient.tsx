"use client";

import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Gavel as GavelIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface Judge {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Project {
  _id: string;
  name: string;
  teamId: {
    _id: string;
    name: string;
  };
  status: string;
}

interface Assignment {
  _id: string;
  judgeId: {
    _id: string;
    name: string;
    email: string;
  };
  projectId: {
    _id: string;
    name: string;
  };
  status: string;
  assignedAt: string;
}

interface JudgingAssignmentClientProps {
  event: any;
  judges: Judge[];
  projects: Project[];
  assignments: Assignment[];
  eventId: string;
}

export default function JudgingAssignmentClient({
  event,
  judges,
  projects,
  assignments,
  eventId,
}: JudgingAssignmentClientProps) {
  const router = useRouter();
  const [selectedJudge, setSelectedJudge] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get assignments grouped by judge
  const getJudgeAssignments = (judgeId: string) => {
    return assignments.filter((a) => a.judgeId._id === judgeId);
  };

  // Get assignments grouped by project
  const getProjectAssignments = (projectId: string) => {
    return assignments.filter((a) => a.projectId._id === projectId);
  };

  const handleToggleProject = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map((p) => p._id));
    }
  };

  const handleAssign = async () => {
    if (!selectedJudge || selectedProjects.length === 0) {
      setError("Please select a judge and at least one project");
      return;
    }

    setIsAssigning(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/events/${eventId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judgeId: selectedJudge,
          projectIds: selectedProjects,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign projects");
      }

      setSuccess(
        `Successfully assigned ${data.created} project(s). ${
          data.skipped > 0 ? `(${data.skipped} already assigned)` : ""
        }`
      );
      setSelectedProjects([]);
      setSelectedJudge("");

      // Refresh page to show new assignments
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to assign projects");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm("Remove this assignment?")) return;

    try {
      const response = await fetch(
        `/api/admin/events/${eventId}/assignments?assignmentId=${assignmentId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete assignment");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete assignment");
    }
  };

  if (projects.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          No submitted projects yet. Projects must be submitted before they can be assigned to judges.
        </Alert>
      </Container>
    );
  }

  if (judges.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          No judges available. Please assign the "judge" role to users in the User Management page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, fontSize: { xs: "1.25rem", sm: "2rem" } }}>
          Judging Assignments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {event.name}
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                {projects.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Submitted Projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                {judges.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available Judges
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                {assignments.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Assignments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Assignment Interface */}
      <Grid container spacing={3}>
        {/* Left: Assign Projects */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Assign Projects to Judge
              </Typography>

              {/* Judge Selector */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Select Judge</InputLabel>
                <Select
                  value={selectedJudge}
                  onChange={(e) => setSelectedJudge(e.target.value)}
                  label="Select Judge"
                >
                  {judges.map((judge) => (
                    <MenuItem key={judge._id} value={judge._id}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                        <span>{judge.name}</span>
                        <Chip
                          label={`${getJudgeAssignments(judge._id).length} assigned`}
                          size="small"
                          sx={{ ml: 2 }}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Project List */}
              <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Select Projects ({selectedProjects.length} selected)
                </Typography>
                <Button size="small" onClick={handleSelectAll}>
                  {selectedProjects.length === projects.length ? "Deselect All" : "Select All"}
                </Button>
              </Box>

              <Box sx={{ maxHeight: 400, overflowY: "auto", border: 1, borderColor: "divider", borderRadius: 1 }}>
                {projects.map((project) => {
                  const projectAssignments = getProjectAssignments(project._id);
                  const alreadyAssigned = selectedJudge
                    ? projectAssignments.some((a) => a.judgeId._id === selectedJudge)
                    : false;

                  return (
                    <Box
                      key={project._id}
                      sx={{
                        p: 2,
                        borderBottom: 1,
                        borderColor: "divider",
                        "&:last-child": { borderBottom: 0 },
                        bgcolor: selectedProjects.includes(project._id)
                          ? "primary.light"
                          : "background.paper",
                        cursor: alreadyAssigned ? "not-allowed" : "pointer",
                        opacity: alreadyAssigned ? 0.5 : 1,
                        "&:hover": {
                          bgcolor: alreadyAssigned
                            ? "background.paper"
                            : selectedProjects.includes(project._id)
                            ? "primary.light"
                            : "action.hover",
                        },
                      }}
                      onClick={() => !alreadyAssigned && handleToggleProject(project._id)}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Checkbox
                          checked={selectedProjects.includes(project._id)}
                          disabled={alreadyAssigned}
                          icon={<UncheckedIcon />}
                          checkedIcon={<CheckIcon />}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {project.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Team: {project.teamId?.name || "Unknown"}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${projectAssignments.length} judges`}
                          size="small"
                          color={projectAssignments.length === 0 ? "default" : "primary"}
                        />
                      </Box>
                      {alreadyAssigned && (
                        <Typography variant="caption" color="warning.main" sx={{ ml: 5 }}>
                          Already assigned to this judge
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleAssign}
                disabled={isAssigning || !selectedJudge || selectedProjects.length === 0}
                sx={{ mt: 3 }}
                startIcon={<GavelIcon />}
              >
                {isAssigning ? "Assigning..." : `Assign ${selectedProjects.length} Project(s)`}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Current Assignments */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Current Assignments ({assignments.length})
              </Typography>

              {assignments.length === 0 ? (
                <Alert severity="info">
                  No assignments yet. Use the form on the left to assign projects to judges.
                </Alert>
              ) : (
                <TableContainer sx={{ maxHeight: 600, overflowX: "auto" }}>
                  <Table stickyHeader size="small" sx={{ minWidth: 400 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Judge</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Project</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow key={assignment._id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {assignment.judgeId.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{assignment.projectId.name}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={assignment.status}
                              size="small"
                              color={
                                assignment.status === "completed"
                                  ? "success"
                                  : assignment.status === "in_progress"
                                  ? "warning"
                                  : "default"
                              }
                              sx={{ textTransform: "capitalize" }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Remove Assignment">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteAssignment(assignment._id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
