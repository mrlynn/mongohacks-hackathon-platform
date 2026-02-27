"use client";

import { useState, useMemo } from "react";
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
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
  Divider,
} from "@mui/material";
import {
  Gavel as GavelIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
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
  event: { _id: string; name: string; [key: string]: unknown };
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

  // Coverage stats
  const coverageStats = useMemo(() => {
    const withJudges = projects.filter(
      (p) => getProjectAssignments(p._id).length > 0
    );
    const withoutJudges = projects.filter(
      (p) => getProjectAssignments(p._id).length === 0
    );
    const percentage =
      projects.length > 0
        ? Math.round((withJudges.length / projects.length) * 100)
        : 0;
    return {
      assigned: withJudges.length,
      unassigned: withoutJudges.length,
      total: projects.length,
      percentage,
    };
  }, [projects, assignments]);

  // Assignments grouped by judge for display
  const assignmentsByJudge = useMemo(() => {
    const grouped: Record<
      string,
      { judge: { _id: string; name: string; email: string }; items: Assignment[] }
    > = {};
    for (const a of assignments) {
      const jid = a.judgeId._id;
      if (!grouped[jid]) {
        grouped[jid] = { judge: a.judgeId, items: [] };
      }
      grouped[jid].items.push(a);
    }
    return Object.values(grouped).sort((a, b) =>
      a.judge.name.localeCompare(b.judge.name)
    );
  }, [assignments]);

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
      const response = await fetch(
        `/api/admin/events/${eventId}/assignments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            judgeId: selectedJudge,
            projectIds: selectedProjects,
          }),
        }
      );

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

      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to assign projects";
      setError(message);
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete assignment";
      setError(message);
    }
  };

  if (projects.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          No submitted projects yet. Projects must be submitted before they can
          be assigned to judges.
        </Alert>
      </Container>
    );
  }

  if (judges.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          No judges available. Please assign the &quot;judge&quot; role to users
          in the User Management page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
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

      {/* Coverage Summary */}
      <Card sx={{ mb: 3 }} variant="outlined">
        <CardContent sx={{ pb: "16px !important" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Assignment Coverage
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {coverageStats.assigned} of {coverageStats.total} projects have
              judges
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={coverageStats.percentage}
            sx={{
              height: 8,
              borderRadius: 4,
              mb: 1.5,
              bgcolor: "grey.200",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                bgcolor:
                  coverageStats.percentage === 100
                    ? "success.main"
                    : coverageStats.percentage > 50
                    ? "primary.main"
                    : "warning.main",
              },
            }}
          />
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {coverageStats.unassigned > 0 && (
              <Chip
                icon={<WarningIcon />}
                label={`${coverageStats.unassigned} projects need judges`}
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
            <Chip
              label={`${judges.length} judges available`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${assignments.length} total assignments`}
              size="small"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

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
                  {judges.map((judge) => {
                    const count = getJudgeAssignments(judge._id).length;
                    return (
                      <MenuItem key={judge._id} value={judge._id}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <span>{judge.name}</span>
                          <Chip
                            label={`${count} assigned`}
                            size="small"
                            color={count > 0 ? "primary" : "default"}
                            variant={count > 0 ? "filled" : "outlined"}
                            sx={{ ml: 2 }}
                          />
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              {/* Project List */}
              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Select Projects ({selectedProjects.length} selected)
                </Typography>
                <Button size="small" onClick={handleSelectAll}>
                  {selectedProjects.length === projects.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </Box>

              <Box
                sx={{
                  maxHeight: 400,
                  overflowY: "auto",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                {projects.map((project) => {
                  const projectAssignments = getProjectAssignments(project._id);
                  const alreadyAssigned = selectedJudge
                    ? projectAssignments.some(
                        (a) => a.judgeId._id === selectedJudge
                      )
                    : false;
                  const hasNoJudges = projectAssignments.length === 0;

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
                          : hasNoJudges
                          ? "warning.50"
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
                      onClick={() =>
                        !alreadyAssigned && handleToggleProject(project._id)
                      }
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
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
                          label={
                            hasNoJudges
                              ? "No judges!"
                              : `${projectAssignments.length} judge${projectAssignments.length !== 1 ? "s" : ""}`
                          }
                          size="small"
                          color={
                            hasNoJudges
                              ? "error"
                              : projectAssignments.length >= 2
                              ? "success"
                              : "primary"
                          }
                          variant={hasNoJudges ? "filled" : "outlined"}
                        />
                      </Box>
                      {alreadyAssigned && (
                        <Typography
                          variant="caption"
                          color="warning.main"
                          sx={{ ml: 5 }}
                        >
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
                disabled={
                  isAssigning ||
                  !selectedJudge ||
                  selectedProjects.length === 0
                }
                sx={{ mt: 3 }}
                startIcon={<GavelIcon />}
              >
                {isAssigning
                  ? "Assigning..."
                  : `Assign ${selectedProjects.length} Project(s)`}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Current Assignments grouped by judge */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Current Assignments ({assignments.length})
              </Typography>

              {assignments.length === 0 ? (
                <Alert severity="info">
                  No assignments yet. Use the form on the left to assign
                  projects to judges.
                </Alert>
              ) : (
                <Box sx={{ maxHeight: 600, overflowY: "auto" }}>
                  {assignmentsByJudge.map((group, idx) => (
                    <Box key={group.judge._id}>
                      {idx > 0 && <Divider sx={{ my: 2 }} />}
                      {/* Judge header */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1.5,
                        }}
                      >
                        <PersonIcon
                          fontSize="small"
                          sx={{ color: "primary.main" }}
                        />
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, flex: 1 }}
                        >
                          {group.judge.name}
                        </Typography>
                        <Chip
                          label={`${group.items.length} project${group.items.length !== 1 ? "s" : ""}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      {/* Project list for this judge */}
                      <Box sx={{ pl: 1 }}>
                        {group.items.map((assignment) => (
                          <Box
                            key={assignment._id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              py: 0.75,
                              px: 1.5,
                              mb: 0.5,
                              borderRadius: 1,
                              bgcolor: "grey.50",
                              "&:hover": { bgcolor: "grey.100" },
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ flex: 1, fontWeight: 500 }}
                            >
                              {assignment.projectId.name}
                            </Typography>
                            <Chip
                              label={assignment.status.replace("_", " ")}
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
                            <Tooltip title="Remove Assignment">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  handleDeleteAssignment(assignment._id)
                                }
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
