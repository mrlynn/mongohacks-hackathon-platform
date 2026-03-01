"use client";

import React from "react";
import { Fab, Box, CircularProgress, Tooltip, Zoom } from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import { useOnboarding } from "@/contexts/OnboardingContext";

export default function JourneyFab() {
  const {
    isDrawerOpen,
    isLoading,
    progress,
    toggleDrawer,
    isDismissed,
    journeyMap,
  } = useOnboarding();

  // Hide when: loading, drawer open, dismissed, no steps, or all complete
  if (
    isLoading ||
    isDrawerOpen ||
    isDismissed ||
    !journeyMap?.steps?.length ||
    progress === 100
  ) {
    return null;
  }

  return (
    <Zoom in>
      <Tooltip title="Your Journey" placement="right">
        <Fab
          size="medium"
          onClick={toggleDrawer}
          sx={{
            position: "fixed",
            bottom: 24,
            left: 24,
            zIndex: (theme) => theme.zIndex.speedDial,
            bgcolor: "background.paper",
            color: "success.main",
            border: 2,
            borderColor: "success.main",
            "&:hover": {
              bgcolor: "success.main",
              color: "white",
            },
            transition: "all 0.2s ease",
          }}
        >
          {/* Progress ring */}
          <CircularProgress
            variant="determinate"
            value={progress}
            color="success"
            size={48}
            thickness={3}
            sx={{
              position: "absolute",
              opacity: 0.5,
            }}
          />
          <RocketLaunchIcon />
        </Fab>
      </Tooltip>
    </Zoom>
  );
}
