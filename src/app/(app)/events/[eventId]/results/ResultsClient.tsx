"use client";

import { useState } from "react";
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
  Grid,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link as MuiLink,
  Divider,
  Stack,
  Alert,
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  ExpandMore as ExpandMoreIcon,
  GitHub as GitHubIcon,
  Language as DemoIcon,
  VideoLibrary as VideoIcon,
  ArrowBack as ArrowBackIcon,
  AutoAwesome as AiIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RubricCriterion {
  name: string;
  weight: number;
  maxScore: number;
}

interface ProjectResult {
  projectId: string;
  rank: number;
  project: {
    _id: string;
    name: string;
    description: string;
    repoUrl: string;
    demoUrl?: string;
    videoUrl?: string;
    technologies?: string[];
    aiSummary?: string;
    aiFeedback?: string;
  };
  team: {
    _id: string;
    name: string;
  } | null;
  averageScores: Record<string, number>;
  totalScore: number;
  maxPossible: number;
  judgeCount: number;
  scores: Array<{
    judgeId: unknown;
    scores: Record<string, number>;
    totalScore: number;
    comments?: string;
    submittedAt: Date;
  }>;
}

interface ResultsClientProps {
  results: ProjectResult[];
  rubric?: RubricCriterion[];
  event: {
    _id: string;
    name: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    resultsPublished: boolean;
    resultsPublishedAt?: Date;
  };
  eventId: string;
  isAdmin: boolean;
}

function toLabel(name: string): string {
  return name
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const DEFAULT_RUBRIC: RubricCriterion[] = [
  { name: "innovation", weight: 1, maxScore: 10 },
  { name: "technical", weight: 1, maxScore: 10 },
  { name: "impact", weight: 1, maxScore: 10 },
  { name: "presentation", weight: 1, maxScore: 10 },
];

export default function ResultsClient({
  results,
  rubric,
  event,
  eventId,
  isAdmin,
}: ResultsClientProps) {
  const router = useRouter();
  const [expandedProject, setExpandedProject] = useState<string | false>(false);

  const criteria = rubric && rubric.length > 0 ? rubric : DEFAULT_RUBRIC;
  const maxPossible = criteria.reduce((s, c) => s + c.maxScore * c.weight, 0);

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

  const getPodiumIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "";
    }
  };

  const handleAccordionChange = (projectId: string) => (
    _event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedProject(isExpanded ? projectId : false);
  };

  // Get top 3 for podium
  const topThree = results.filter((r) => r.rank <= 3 && r.rank > 0);

  // Get all results for leaderboard
  const allResults = results.filter((r) => r.rank > 0);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 4 } }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/events/${eventId}/hub`)}
          sx={{ mb: 2 }}
        >
          Back to Event Hub
        </Button>
        <Box
          sx={{
            textAlign: "center",
            background: "linear-gradient(135deg, #00684A 0%, #00ED64 100%)",
            color: "white",
            borderRadius: 2,
            p: { xs: 3, sm: 4 },
            mb: { xs: 2, sm: 4 },
          }}
        >
          <TrophyIcon sx={{ fontSize: { xs: 48, sm: 80 }, mb: 2 }} />
          <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, fontSize: { xs: "1.75rem", sm: "2.5rem", md: "3.5rem" } }}>
            Results
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 500, mb: 2, fontSize: { xs: "1rem", sm: "1.5rem" } }}>
            {event.name}
          </Typography>
          {event.resultsPublishedAt && (
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Published on {new Date(event.resultsPublishedAt).toLocaleDateString()}
            </Typography>
          )}
          {isAdmin && (
            <Chip
              label="ADMIN VIEW"
              color="warning"
              sx={{ mt: 2, fontWeight: 700 }}
            />
          )}
        </Box>
      </Box>

      {allResults.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            No results available yet
          </Typography>
          <Typography color="text.secondary">
            Projects are still being judged. Check back soon!
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Top 3 Podium */}
          {topThree.length > 0 && (
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: "center", fontSize: { xs: "1.5rem", sm: "2rem" } }}>
                🏆 Top 3 Winners
              </Typography>
              <Grid container spacing={3}>
                {topThree.map((result) => (
                  <Grid key={result.projectId} size={{ xs: 12, md: 4 }}>
                    <Card
                      sx={{
                        background: getPodiumColor(result.rank),
                        color: "white",
                        textAlign: "center",
                        position: "relative",
                        overflow: "visible",
                      }}
                    >
                      <CardContent sx={{ py: { xs: 3, sm: 4 } }}>
                        <Typography variant="h1" sx={{ fontSize: { xs: 40, sm: 60 }, mb: 2 }}>
                          {getPodiumIcon(result.rank)}
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, fontSize: { xs: "1.5rem", sm: "2.5rem" } }}>
                          #{result.rank}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: "1.1rem", sm: "1.5rem" } }}>
                          {result.project.name}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                          {result.team?.name || "Individual"}
                        </Typography>
                        <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.3)" }} />
                        <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, fontSize: { xs: "2rem", sm: "3.5rem" } }}>
                          {result.totalScore.toFixed(1)}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          out of {result.maxPossible ?? maxPossible} points
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, display: "block", mt: 1 }}>
                          {result.judgeCount} judge{result.judgeCount !== 1 ? "s" : ""}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Full Leaderboard */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              Full Leaderboard
            </Typography>
            <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "grey.100" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Project</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Team</TableCell>
                    {criteria.map((c) => (
                      <TableCell key={c.name} sx={{ fontWeight: 700 }} align="center">
                        {toLabel(c.name)}
                        {c.weight !== 1 && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            {c.weight}x
                          </Typography>
                        )}
                      </TableCell>
                    ))}
                    <TableCell sx={{ fontWeight: 700 }} align="center">
                      Total Score
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">
                      Judges
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allResults.map((result) => (
                    <TableRow
                      key={result.projectId}
                      hover
                      sx={{
                        backgroundColor:
                          result.rank <= 3 ? "rgba(0, 237, 100, 0.05)" : "inherit",
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            #{result.rank}
                          </Typography>
                          {result.rank <= 3 && (
                            <Typography sx={{ fontSize: 24 }}>
                              {getPodiumIcon(result.rank)}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600 }}>
                          {result.project.name}
                        </Typography>
                        {result.project.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {result.project.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {result.team ? (
                          <MuiLink
                            component={Link}
                            href={`/events/${eventId}/teams/${result.team._id}`}
                            sx={{ fontWeight: 500 }}
                          >
                            {result.team.name}
                          </MuiLink>
                        ) : (
                          <Typography color="text.secondary">Individual</Typography>
                        )}
                      </TableCell>
                      {criteria.map((c) => (
                        <TableCell key={c.name} align="center">
                          <Chip
                            label={(result.averageScores[c.name] ?? 0).toFixed(1)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      ))}
                      <TableCell align="center">
                        <Chip
                          label={`${result.totalScore.toFixed(1)} / ${result.maxPossible ?? maxPossible}`}
                          color="primary"
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {result.judgeCount}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Project Details */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              Project Details
            </Typography>
            {allResults.map((result) => (
              <Accordion
                key={result.projectId}
                expanded={expandedProject === result.projectId}
                onChange={handleAccordionChange(result.projectId)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      #{result.rank}
                    </Typography>
                    <Typography sx={{ fontWeight: 600, flex: 1 }}>
                      {result.project.name}
                    </Typography>
                    <Chip
                      label={`${result.totalScore.toFixed(1)} / ${result.maxPossible ?? maxPossible}`}
                      color="primary"
                      size="small"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={3}>
                    {/* Project Info */}
                    <Box>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {result.project.description}
                      </Typography>
                      {result.project.technologies &&
                        result.project.technologies.length > 0 && (
                          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                            {result.project.technologies.map((tech, idx) => (
                              <Chip key={idx} label={tech} size="small" />
                            ))}
                          </Box>
                        )}
                      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                        {result.project.repoUrl && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<GitHubIcon />}
                            href={result.project.repoUrl}
                            target="_blank"
                          >
                            Repository
                          </Button>
                        )}
                        {result.project.demoUrl && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DemoIcon />}
                            href={result.project.demoUrl}
                            target="_blank"
                          >
                            Demo
                          </Button>
                        )}
                        {result.project.videoUrl && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VideoIcon />}
                            href={result.project.videoUrl}
                            target="_blank"
                          >
                            Video
                          </Button>
                        )}
                      </Stack>
                    </Box>

                    {/* AI Summary */}
                    {result.project.aiSummary && (
                      <>
                        <Divider />
                        <Alert
                          icon={<AiIcon />}
                          severity="info"
                          sx={{
                            bgcolor: "rgba(0, 237, 100, 0.08)",
                            borderLeft: 4,
                            borderColor: "#00ED64",
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#00684A" }}>
                            AI-Generated Summary
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                            {result.project.aiSummary}
                          </Typography>
                        </Alert>
                      </>
                    )}

                    {/* AI Feedback */}
                    {result.project.aiFeedback && (
                      <Alert
                        icon={<AiIcon />}
                        severity="success"
                        sx={{
                          bgcolor: "rgba(0, 104, 74, 0.08)",
                          borderLeft: 4,
                          borderColor: "#00684A",
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#00684A" }}>
                          AI Feedback
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.7, whiteSpace: "pre-line" }}>
                          {result.project.aiFeedback}
                        </Typography>
                      </Alert>
                    )}

                    <Divider />

                    {/* Score Breakdown — dynamic */}
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Score Breakdown
                      </Typography>
                      <Grid container spacing={2}>
                        {criteria.map((c) => (
                          <Grid key={c.name} size={{ xs: 6, sm: Math.max(2, Math.floor(12 / criteria.length)) }}>
                            <Paper sx={{ p: 2, textAlign: "center" }}>
                              <Typography variant="caption" color="text.secondary">
                                {toLabel(c.name)}
                              </Typography>
                              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {(result.averageScores[c.name] ?? 0).toFixed(1)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                / {c.maxScore}
                                {c.weight !== 1 && ` (${c.weight}x)`}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 2, textAlign: "center" }}
                      >
                        Average of {result.judgeCount} judge
                        {result.judgeCount !== 1 ? "s" : ""}
                      </Typography>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </>
      )}
    </Container>
  );
}
