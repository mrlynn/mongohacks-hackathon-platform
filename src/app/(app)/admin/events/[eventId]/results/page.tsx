"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Switch,
  FormControlLabel,
  Snackbar,
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProjectResult {
  _id: string;
  name: string;
  description: string;
  category: string;
  repoUrl: string;
  demoUrl?: string;
  team: { _id: string; name: string } | null;
  teamMembers: Array<{ _id: string; name: string }>;
  judgeCount: number;
  averageScores: {
    innovation: number;
    technical: number;
    impact: number;
    presentation: number;
    total: number;
  };
  individualScores: Array<{
    judge: string;
    scores: {
      innovation: number;
      technical: number;
      impact: number;
      presentation: number;
    };
    totalScore: number;
    comments: string;
  }>;
}

export default function ResultsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const router = useRouter();
  const [eventId, setEventId] = useState("");
  const [results, setResults] = useState<ProjectResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventName, setEventName] = useState("");
  const [resultsPublished, setResultsPublished] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  useEffect(() => {
    params.then((p) => {
      setEventId(p.eventId);
      fetchEvent(p.eventId);
      fetchResults(p.eventId);
    });
  }, []);

  const fetchEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/events/${id}`);
      const data = await res.json();
      if (data.event) {
        setEventName(data.event.name);
        setResultsPublished(data.event.resultsPublished || false);
      }
    } catch (err) {
      console.error("Failed to fetch event:", err);
    }
  };

  const handlePublishToggle = async (publish: boolean) => {
    setPublishLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/publish-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setResultsPublished(publish);
        setSnackbar({
          open: true,
          message: publish
            ? "✅ Results are now public!"
            : "🔒 Results are now hidden from public view",
        });
      } else {
        setSnackbar({
          open: true,
          message: `❌ ${data.error || "Failed to update"}`,
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "❌ Failed to update results visibility",
      });
    } finally {
      setPublishLoading(false);
    }
  };

  const fetchResults = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/events/${id}/results`);
      const data = await res.json();

      if (res.ok) {
        setResults(data.results || []);
      } else {
        setError(data.error || "Failed to load results");
      }
    } catch (err) {
      setError("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Rank", "Project", "Team", "Innovation", "Technical", "Impact", "Presentation", "Total", "Judges"];
    const rows = results.map((result, idx) => [
      idx + 1,
      result.name,
      result.team?.name || "N/A",
      result.averageScores.innovation,
      result.averageScores.technical,
      result.averageScores.impact,
      result.averageScores.presentation,
      result.averageScores.total,
      result.judgeCount,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `results-${eventName.replace(/\s+/g, "-")}.csv`;
    a.click();
  };

  const getPodiumColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)";
      case 2:
        return "linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)";
      case 3:
        return "linear-gradient(135deg, #CD7F32 0%, #B87333 100%)";
      default:
        return "none";
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/admin/events")}
          sx={{ mb: 2 }}
        >
          Back to Events
        </Button>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              🏆 Results & Leaderboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {eventName}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportToCSV}
            disabled={results.length === 0}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Publish Control */}
      <Card sx={{ mb: 4, border: 2, borderColor: resultsPublished ? "success.main" : "warning.main" }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {resultsPublished ? (
                <VisibilityIcon sx={{ fontSize: 40, color: "success.main" }} />
              ) : (
                <VisibilityOffIcon sx={{ fontSize: 40, color: "warning.main" }} />
              )}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Results Visibility
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {resultsPublished
                    ? "Results are publicly visible to all participants and visitors"
                    : "Results are hidden - only admins can view them"}
                </Typography>
              </Box>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={resultsPublished}
                  onChange={(e) => handlePublishToggle(e.target.checked)}
                  disabled={publishLoading || results.length === 0}
                  color="success"
                />
              }
              label={resultsPublished ? "Published" : "Hidden"}
              labelPlacement="start"
            />
          </Box>
          {results.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              You need judged projects before you can publish results.
            </Alert>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {results.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No scores submitted yet. Projects need to be judged first.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Top 3 Podium */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {results.slice(0, 3).map((result, idx) => (
              <Grid key={result._id} size={{ xs: 12, md: 4 }}>
                <Card
                  sx={{
                    background: getPodiumColor(idx + 1),
                    color: "white",
                    textAlign: "center",
                  }}
                >
                  <CardContent sx={{ py: 4 }}>
                    <TrophyIcon sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
                      #{idx + 1}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      {result.name}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {result.team?.name}
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 900 }}>
                      {result.averageScores.total}
                    </Typography>
                    <Typography variant="caption">/ 40</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Full Leaderboard */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Project</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Team</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Innovation</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Technical</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Impact</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Presentation</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Total</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Judges</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((result, idx) => (
                  <TableRow key={result._id} hover>
                    <TableCell>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        #{idx + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>{result.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {result.category}
                      </Typography>
                    </TableCell>
                    <TableCell>{result.team?.name || "N/A"}</TableCell>
                    <TableCell align="center">{result.averageScores.innovation}</TableCell>
                    <TableCell align="center">{result.averageScores.technical}</TableCell>
                    <TableCell align="center">{result.averageScores.impact}</TableCell>
                    <TableCell align="center">{result.averageScores.presentation}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${result.averageScores.total} / 40`}
                        color="primary"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="center">{result.judgeCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Individual Scores */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Individual Judge Scores
            </Typography>
            {results.map((result, idx) => (
              <Accordion key={result._id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600 }}>
                    #{idx + 1} {result.name} - {result.averageScores.total}/40
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Judge</TableCell>
                          <TableCell align="center">Innovation</TableCell>
                          <TableCell align="center">Technical</TableCell>
                          <TableCell align="center">Impact</TableCell>
                          <TableCell align="center">Presentation</TableCell>
                          <TableCell align="center">Total</TableCell>
                          <TableCell>Comments</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result.individualScores.map((score, scoreIdx) => (
                          <TableRow key={scoreIdx}>
                            <TableCell>{score.judge}</TableCell>
                            <TableCell align="center">{score.scores.innovation}</TableCell>
                            <TableCell align="center">{score.scores.technical}</TableCell>
                            <TableCell align="center">{score.scores.impact}</TableCell>
                            <TableCell align="center">{score.scores.presentation}</TableCell>
                            <TableCell align="center">{score.totalScore}</TableCell>
                            <TableCell>{score.comments || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </>
      )}

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Container>
  );
}
