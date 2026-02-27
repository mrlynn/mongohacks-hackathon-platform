"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  PlayArrow as RunIcon,
  Stop as CancelIcon,
  DeleteForever as DeleteIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as RunningIcon,
  Cancel as CancelledIcon,
  Storage as StorageIcon,
  Description as FileIcon,
  Lock as LockIcon,
  LockOpen as PublicIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";

interface IngestionStats {
  isRunning: boolean;
  totalChunks: number;
  totalFiles: number;
  lastRun: {
    runId: string;
    completedAt: string;
    stats: RunStats;
  } | null;
}

interface RunStats {
  filesProcessed: number;
  filesSkipped: number;
  chunksCreated: number;
  chunksDeleted: number;
  embeddingsGenerated: number;
  totalTokens: number;
  errors: Array<{ file: string; error: string }>;
}

interface IngestionRun {
  _id: string;
  runId: string;
  status: "running" | "completed" | "failed" | "cancelled";
  stats: RunStats;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
}

interface IndexedFile {
  filePath: string;
  title: string;
  category: string;
  url: string;
  accessLevel: "public" | "authenticated";
  chunks: number;
  totalTokens: number;
  lastIngested: string;
}

const statusConfig = {
  running: { icon: <RunningIcon />, color: "warning" as const, label: "Running" },
  completed: { icon: <SuccessIcon />, color: "success" as const, label: "Completed" },
  failed: { icon: <ErrorIcon />, color: "error" as const, label: "Failed" },
  cancelled: { icon: <CancelledIcon />, color: "default" as const, label: "Cancelled" },
};

export default function RagAdminPage() {
  const [stats, setStats] = useState<IngestionStats | null>(null);
  const [runs, setRuns] = useState<IngestionRun[]>([]);
  const [files, setFiles] = useState<IndexedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, runsRes, filesRes] = await Promise.all([
        fetch("/api/admin/rag/status"),
        fetch("/api/admin/rag/runs"),
        fetch("/api/admin/rag/files"),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (runsRes.ok) {
        const data = await runsRes.json();
        setRuns(data.runs);
      }
      if (filesRes.ok) {
        const data = await filesRes.json();
        setFiles(data.files);
      }
      setError(null);
    } catch {
      setError("Failed to fetch RAG status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll while ingesting
  useEffect(() => {
    if (!ingesting && !stats?.isRunning) return;
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [ingesting, stats?.isRunning, fetchData]);

  // Sync ingesting state when a run completes
  useEffect(() => {
    if (ingesting && stats && !stats.isRunning) {
      setIngesting(false);
    }
  }, [ingesting, stats]);

  const handleRunIngestion = async (forceReindex: boolean) => {
    setIngesting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/rag/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceReindex }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to start ingestion");
        setIngesting(false);
      }
      await fetchData();
    } catch {
      setError("Failed to start ingestion");
      setIngesting(false);
    }
  };

  const handleCancel = async () => {
    const runningRun = runs.find((r) => r.status === "running");
    if (!runningRun) return;
    try {
      await fetch("/api/admin/rag/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: runningRun.runId }),
      });
      await fetchData();
    } catch {
      setError("Failed to cancel ingestion");
    }
  };

  const handleDeleteAll = async () => {
    setDeleteDialogOpen(false);
    try {
      const res = await fetch("/api/admin/rag/documents", {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchData();
      }
    } catch {
      setError("Failed to delete documents");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isRunning = stats?.isRunning || ingesting;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          RAG Knowledge Base
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
          >
            Refresh
          </Button>
          {isRunning ? (
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                startIcon={<RunIcon />}
                onClick={() => handleRunIngestion(false)}
              >
                Run Changed
              </Button>
              <Button
                variant="contained"
                startIcon={<RunIcon />}
                onClick={() => handleRunIngestion(true)}
              >
                Full Re-index
              </Button>
            </>
          )}
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Status Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
          gap: 2,
          mb: 3,
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Status
          </Typography>
          <Chip
            icon={isRunning ? <RunningIcon /> : <SuccessIcon />}
            label={isRunning ? "Running" : "Ready"}
            color={isRunning ? "warning" : "success"}
            size="small"
            sx={{ mt: 0.5 }}
          />
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Documents
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {stats?.totalChunks ?? 0}
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              chunks
            </Typography>
          </Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Source Files
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {stats?.totalFiles ?? 0}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Last Run
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {stats?.lastRun
              ? formatDistanceToNow(new Date(stats.lastRun.completedAt), {
                  addSuffix: true,
                })
              : "Never"}
          </Typography>
        </Paper>
      </Box>

      {/* Recent Ingestion Runs */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <StorageIcon sx={{ mr: 1, color: "text.secondary" }} />
          <Typography fontWeight={600}>Recent Ingestion Runs</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {runs.length === 0 ? (
            <Typography color="text.secondary">
              No ingestion runs yet. Click &quot;Full Re-index&quot; to get started.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Run ID</TableCell>
                    <TableCell align="right">Files</TableCell>
                    <TableCell align="right">Chunks</TableCell>
                    <TableCell align="right">Tokens</TableCell>
                    <TableCell align="right">Duration</TableCell>
                    <TableCell>Started</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {runs.map((run) => {
                    const config = statusConfig[run.status];
                    return (
                      <TableRow key={run._id}>
                        <TableCell>
                          <Chip
                            icon={config.icon}
                            label={config.label}
                            color={config.color}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                            {run.runId.slice(0, 8)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {run.stats.filesProcessed}
                          {run.stats.filesSkipped > 0 && (
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                              sx={{ ml: 0.5 }}
                            >
                              (+{run.stats.filesSkipped} skipped)
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {run.stats.chunksCreated}
                          {run.stats.chunksDeleted > 0 && (
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                              sx={{ ml: 0.5 }}
                            >
                              (-{run.stats.chunksDeleted})
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {run.stats.totalTokens.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          {run.durationMs
                            ? `${(run.durationMs / 1000).toFixed(1)}s`
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(run.startedAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Show errors from the latest run if any */}
          {runs[0]?.stats.errors.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Errors from last run:
              </Typography>
              {runs[0].stats.errors.map((err, i) => (
                <Typography key={i} variant="body2" fontFamily="monospace" fontSize="0.75rem">
                  {err.file}: {err.error}
                </Typography>
              ))}
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Indexed Files */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <FileIcon sx={{ mr: 1, color: "text.secondary" }} />
          <Typography fontWeight={600}>
            Indexed Files ({files.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {files.length === 0 ? (
            <Typography color="text.secondary">
              No files indexed yet.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>File</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Access</TableCell>
                    <TableCell align="right">Chunks</TableCell>
                    <TableCell align="right">Tokens</TableCell>
                    <TableCell>Last Indexed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.filePath}>
                      <TableCell>
                        <Tooltip title={file.filePath}>
                          <Typography variant="body2" fontWeight={500}>
                            {file.title}
                          </Typography>
                        </Tooltip>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontFamily="monospace"
                        >
                          {file.filePath}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={file.category} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={
                            file.accessLevel === "public" ? (
                              <PublicIcon />
                            ) : (
                              <LockIcon />
                            )
                          }
                          label={file.accessLevel}
                          size="small"
                          color={
                            file.accessLevel === "public"
                              ? "success"
                              : "default"
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">{file.chunks}</TableCell>
                      <TableCell align="right">
                        {file.totalTokens.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(file.lastIngested), {
                          addSuffix: true,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Danger Zone */}
      <Paper sx={{ p: 2, mt: 3, border: "1px solid", borderColor: "error.main" }}>
        <Typography variant="subtitle2" color="error" gutterBottom>
          Danger Zone
        </Typography>
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete All Documents
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
          Wipe all indexed chunks. You will need to re-run ingestion.
        </Typography>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete All RAG Documents?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete all {stats?.totalChunks ?? 0} indexed
            chunks from {stats?.totalFiles ?? 0} files. The chat assistant will
            not work until you re-run ingestion.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAll} color="error" variant="contained">
            Delete All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
