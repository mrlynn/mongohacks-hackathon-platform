"use client";

import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  LinearProgress,
} from "@mui/material";
import {
  Gavel as GavelIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import Link from "next/link";

interface EventAssignment {
  eventId: string;
  eventName: string;
  eventStatus: string;
  totalProjects: number;
  scoredProjects: number;
}

const statusColors: Record<
  string,
  "default" | "success" | "info" | "warning"
> = {
  draft: "default",
  open: "success",
  in_progress: "info",
  concluded: "warning",
};

export default function JudgingLandingClient({
  eventAssignments,
}: {
  eventAssignments: EventAssignment[];
}) {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: { xs: 2, sm: 4 } }}>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
        >
          <GavelIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.5rem", sm: "2rem" },
            }}
          >
            My Judging Assignments
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Review and score projects assigned to you
        </Typography>
      </Box>

      {eventAssignments.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 8, textAlign: "center" }}>
            <GavelIcon
              sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
            />
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              No judging assignments yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You&apos;ll be notified when an event organizer assigns you
              projects to judge.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {eventAssignments.map((ea) => {
            const progress =
              ea.totalProjects > 0
                ? Math.round(
                    (ea.scoredProjects / ea.totalProjects) * 100
                  )
                : 0;
            const isComplete = ea.scoredProjects === ea.totalProjects;

            return (
              <Grid key={ea.eventId} size={{ xs: 12, sm: 6 }}>
                <Card elevation={2}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {ea.eventName}
                      </Typography>
                      <Chip
                        label={ea.eventStatus.replace("_", " ")}
                        size="small"
                        color={statusColors[ea.eventStatus] || "default"}
                        sx={{ textTransform: "capitalize" }}
                      />
                    </Box>

                    {/* Progress */}
                    <Box sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Scoring Progress
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600 }}
                        >
                          {ea.scoredProjects} / {ea.totalProjects}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "grey.200",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                            bgcolor: isComplete
                              ? "success.main"
                              : "primary.main",
                          },
                        }}
                      />
                    </Box>

                    {isComplete ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="All projects scored"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        label={`${ea.totalProjects - ea.scoredProjects} remaining`}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      component={Link}
                      href={`/judging/${ea.eventId}`}
                      endIcon={<ArrowForwardIcon />}
                    >
                      {isComplete ? "Review Scores" : "Start Judging"}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}
