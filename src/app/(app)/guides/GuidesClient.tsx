"use client";

import { useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Alert,
} from "@mui/material";
import {
  PlayArrow as PlayArrowIcon,
  Replay as ReplayIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { getJourneyMap } from "@/lib/onboarding/journey-steps";
import { getStepIcon } from "@/lib/onboarding/get-icon";
import { useOnboardingSafe } from "@/contexts/OnboardingContext";

export default function GuidesClient({ userRole }: { userRole: string }) {
  const router = useRouter();
  const onboarding = useOnboardingSafe();

  const journeyMap = useMemo(() => getJourneyMap(userRole), [userRole]);

  if (!journeyMap || journeyMap.steps.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Guides
        </Typography>
        <Alert severity="info">
          No guides are available for your current role.
        </Alert>
      </Container>
    );
  }

  const completedSteps = onboarding?.completedSteps ?? new Set<string>();
  const completedCount = journeyMap.steps.filter((s) =>
    completedSteps.has(s.id)
  ).length;
  const totalSteps = journeyMap.steps.length;
  const progressPercent =
    totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const handleStartTour = () => {
    if (onboarding) {
      onboarding.startTour();
    } else {
      window.dispatchEvent(new CustomEvent("start-onboarding-tour"));
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Guides
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Step-by-step guides to help you get the most out of the platform.
      </Typography>

      <Card
        variant="outlined"
        sx={{
          borderColor: "primary.main",
          borderWidth: 2,
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Your Journey
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {journeyMap.welcomeMessage}
              </Typography>
            </Box>
            <Chip
              label={userRole.replace("_", " ")}
              size="small"
              sx={{
                bgcolor: "primary.main",
                color: "white",
                fontWeight: 600,
                textTransform: "uppercase",
                fontSize: "0.7rem",
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 0.5,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {completedCount} of {totalSteps} steps completed
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progressPercent}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>

          <Button
            variant="contained"
            startIcon={onboarding?.tourCompleted ? <ReplayIcon /> : <PlayArrowIcon />}
            onClick={handleStartTour}
            sx={{ mb: 2 }}
          >
            {onboarding?.tourCompleted
              ? "Restart Guided Tour"
              : "Start Guided Tour"}
          </Button>

          <List disablePadding>
            {journeyMap.steps.map((step) => {
              const isCompleted = completedSteps.has(step.id);
              const IconComponent = getStepIcon(step.icon);

              return (
                <ListItem
                  key={step.id}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    cursor: step.href ? "pointer" : "default",
                    "&:hover": step.href
                      ? { bgcolor: "action.hover" }
                      : undefined,
                    opacity: isCompleted ? 0.7 : 1,
                  }}
                  onClick={() => {
                    if (step.href) router.push(step.href);
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <IconComponent
                      fontSize="small"
                      color={isCompleted ? "success" : "action"}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{
                            textDecoration: isCompleted
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {step.title}
                        </Typography>
                      </Box>
                    }
                    secondary={step.description}
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                  <ListItemIcon sx={{ minWidth: 28, justifyContent: "center" }}>
                    {isCompleted ? (
                      <CheckCircleIcon
                        fontSize="small"
                        color="success"
                      />
                    ) : (
                      <UncheckedIcon
                        fontSize="small"
                        sx={{ color: "text.disabled" }}
                      />
                    )}
                  </ListItemIcon>
                </ListItem>
              );
            })}
          </List>
        </CardContent>
      </Card>
    </Container>
  );
}
