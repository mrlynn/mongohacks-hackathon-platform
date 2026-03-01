"use client";

import React from "react";
import {
  SwipeableDrawer,
  Box,
  Typography,
  LinearProgress,
  Button,
  IconButton,
  List,
  Divider,
  Alert,
  alpha,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ExploreIcon from "@mui/icons-material/Explore";
import CloseIcon from "@mui/icons-material/Close";
import { useOnboarding } from "@/contexts/OnboardingContext";
import JourneyStepItem from "./JourneyStepItem";

export default function JourneyDrawer() {
  const {
    journeyMap,
    completedSteps,
    isDrawerOpen,
    isLoading,
    progress,
    isPreviewMode,
    closeDrawer,
    openDrawer,
    dismissJourney,
    startTour,
    markFirstLoginSeen,
    isFirstLogin,
    tourCompleted,
  } = useOnboarding();

  if (isLoading || !journeyMap) return null;

  const effectiveSteps = journeyMap.steps;
  const completedCount = effectiveSteps.filter((s) =>
    completedSteps.has(s.id)
  ).length;
  const allComplete = completedCount === effectiveSteps.length;

  const handleFirstLoginDismiss = () => {
    markFirstLoginSeen();
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={isDrawerOpen}
      onClose={closeDrawer}
      onOpen={openDrawer}
      disableSwipeToOpen
      sx={{
        "& .MuiDrawer-paper": {
          maxHeight: "65vh",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          bgcolor: "background.paper",
          backgroundImage: "none",
        },
      }}
    >
      <Box sx={{ overflow: "auto" }}>
        {/* Drag handle */}
        <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 0.5 }}>
          <Box
            sx={{
              width: 40,
              height: 4,
              bgcolor: "grey.400",
              borderRadius: 2,
            }}
          />
        </Box>

        {/* Header */}
        <Box sx={{ px: 3, pb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <RocketLaunchIcon color="success" />
              <Typography variant="h6" fontWeight={700}>
                Your Journey
              </Typography>
            </Box>
            <IconButton size="small" onClick={closeDrawer}>
              <KeyboardArrowDownIcon />
            </IconButton>
          </Box>

          {/* Preview mode banner when impersonating */}
          {isPreviewMode && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Preview mode — viewing this user&apos;s journey. Changes won&apos;t be saved.
            </Alert>
          )}

          {/* Welcome message on first login */}
          {isFirstLogin && !isPreviewMode && (
            <Alert
              severity="success"
              sx={{ mb: 2 }}
              onClose={handleFirstLoginDismiss}
            >
              {journeyMap.welcomeMessage}
            </Alert>
          )}

          {/* Progress bar */}
          <Box sx={{ mb: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.5,
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {allComplete
                  ? "All steps completed!"
                  : `${completedCount} of ${effectiveSteps.length} steps completed`}
              </Typography>
              <Typography variant="caption" color="success.main" fontWeight={700}>
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              color="success"
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.12),
              }}
            />
          </Box>
        </Box>

        <Divider />

        {/* Step list */}
        <List sx={{ px: 1, py: 1 }}>
          {effectiveSteps.map((step, index) => {
            const completed = completedSteps.has(step.id);
            const isCurrent =
              !completed &&
              effectiveSteps
                .slice(0, index)
                .every((s) => completedSteps.has(s.id));
            return (
              <JourneyStepItem
                key={step.id}
                step={step}
                completed={completed}
                isCurrent={isCurrent}
                index={index}
              />
            );
          })}
        </List>

        <Divider />

        {/* Footer actions */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            gap: 1.5,
            justifyContent: "space-between",
          }}
        >
          {!tourCompleted && (
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<ExploreIcon />}
              onClick={startTour}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Take Guided Tour
            </Button>
          )}
          {!isPreviewMode && (
            <Button
              variant="text"
              size="small"
              color="inherit"
              onClick={dismissJourney}
              sx={{
                textTransform: "none",
                color: "text.secondary",
                ml: "auto",
              }}
            >
              Dismiss
            </Button>
          )}
        </Box>
      </Box>
    </SwipeableDrawer>
  );
}
