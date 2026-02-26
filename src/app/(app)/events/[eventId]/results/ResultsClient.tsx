"use client";

import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  LinearProgress,
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  GitHub as GitHubIcon,
  Launch as LaunchIcon,
  Star as StarIcon,
} from "@mui/icons-material";

interface Result {
  projectId: string;
  rank: number;
  project: any;
  team: any;
  averageScores: {
    innovation: number;
    technical: number;
    impact: number;
    presentation: number;
  };
  totalScore: number;
  judgeCount: number;
}

interface ResultsClientProps {
  results: Result[];
  event: any;
  eventId: string;
  isAdmin: boolean;
}

export default function ResultsClient({
  results,
  event,
  eventId,
  isAdmin,
}: ResultsClientProps) {
  const topThree = results.filter((r) => r.rank <= 3 && r.totalScore > 0);
  const allResults = results.filter((r) => r.totalScore > 0);

  const getRankColor = (rank: number) => {
    if (rank === 1) return "gold";
    if (rank === 2) return "silver";
    if (rank === 3) return "#CD7F32"; // Bronze
    return "default";
  };

  const getTrophySize = (rank: number) => {
    if (rank === 1) return 80;
    if (rank === 2) return 64;
    if (rank === 3) return 56;
    return 40;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
          🏆 Final Results
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
          {event.name}
        </Typography>
        {event.resultsPublishedAt && (
          <Typography variant="body2" color="text.secondary">
            Published on {new Date(event.resultsPublishedAt).toLocaleDateString()}
          </Typography>
        )}
      </Box>

      {/* Admin Preview Notice */}
      {isAdmin && !event.resultsPublished && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          <strong>Admin Preview:</strong> Results are not yet published. Only admins can see this page.
          Publish results from the event admin page to make them public.
        </Alert>
      )}

      {/* No Results Yet */}
      {allResults.length === 0 && (
        <Alert severity="info">
          No projects have been judged yet. Results will appear here after judging is complete.
        </Alert>
      )}

      {/* Winner Podium */}
      {topThree.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: "center" }}>
            🎉 Top Winners 🎉
          </Typography>
          
          <Grid container spacing={3} justifyContent="center">
            {topThree.map((result) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={result.projectId}>
                <Card
                  sx={{
                    height: "100%",
                    border: 3,
                    borderColor: getRankColor(result.rank),
                    bgcolor: result.rank === 1 ? "primary.light" : "background.paper",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-8px)",
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: "center", p: 4 }}>
                    {/* Trophy */}
                    <TrophyIcon
                      sx={{
                        fontSize: getTrophySize(result.rank),
                        color: getRankColor(result.rank),
                        mb: 2,
                      }}
                    />

                    {/* Rank */}
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {result.rank === 1 && "🥇 1st Place"}
                      {result.rank === 2 && "🥈 2nd Place"}
                      {result.rank === 3 && "🥉 3rd Place"}
                    </Typography>

                    {/* Project Name */}
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      {result.project.name}
                    </Typography>

                    {/* Team */}
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      Team: <strong>{result.team?.name || "Unknown"}</strong>
                    </Typography>

                    {/* Score */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: "primary.main" }}>
                        {result.totalScore.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        out of 40 points
                      </Typography>
                    </Box>

                    {/* Judge Count */}
                    <Chip
                      label={`Scored by ${result.judgeCount} judge${result.judgeCount !== 1 ? "s" : ""}`}
                      size="small"
                      sx={{ mb: 2 }}
                    />

                    {/* Links */}
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mt: 2 }}>
                      {result.project.repoUrl && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<GitHubIcon />}
                          href={result.project.repoUrl}
                          target="_blank"
                        >
                          Repo
                        </Button>
                      )}
                      {result.project.demoUrl && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<LaunchIcon />}
                          href={result.project.demoUrl}
                          target="_blank"
                        >
                          Demo
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Full Leaderboard */}
      {allResults.length > 0 && (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            📊 Full Leaderboard
          </Typography>

          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "primary.light" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Project</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Team</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Innovation</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Technical</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Impact</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Presentation</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Judges</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Links</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allResults.map((result) => (
                  <TableRow
                    key={result.projectId}
                    hover
                    sx={{
                      bgcolor:
                        result.rank === 1
                          ? "gold"
                          : result.rank === 2
                          ? "silver"
                          : result.rank === 3
                          ? "#CD7F32"
                          : "inherit",
                      "& td": {
                        color: result.rank <= 3 ? "white" : "inherit",
                      },
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={`#${result.rank}`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: result.rank <= 3 ? "rgba(255,255,255,0.2)" : "default",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{result.project.name}</TableCell>
                    <TableCell>{result.team?.name || "Unknown"}</TableCell>
                    <TableCell align="center">{result.averageScores.innovation.toFixed(1)}</TableCell>
                    <TableCell align="center">{result.averageScores.technical.toFixed(1)}</TableCell>
                    <TableCell align="center">{result.averageScores.impact.toFixed(1)}</TableCell>
                    <TableCell align="center">{result.averageScores.presentation.toFixed(1)}</TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                        {result.totalScore.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={result.judgeCount} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                        {result.project.repoUrl && (
                          <Button
                            size="small"
                            href={result.project.repoUrl}
                            target="_blank"
                            sx={{ minWidth: 40, p: 0.5 }}
                          >
                            <GitHubIcon fontSize="small" />
                          </Button>
                        )}
                        {result.project.demoUrl && (
                          <Button
                            size="small"
                            href={result.project.demoUrl}
                            target="_blank"
                            sx={{ minWidth: 40, p: 0.5 }}
                          >
                            <LaunchIcon fontSize="small" />
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Footer */}
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Congratulations to all participants! 🎉
        </Typography>
      </Box>
    </Container>
  );
}
