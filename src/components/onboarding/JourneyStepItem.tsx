"use client";

import React from "react";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Box,
  Typography,
  alpha,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { getStepIcon } from "@/lib/onboarding/get-icon";
import type { JourneyStep } from "@/lib/onboarding/journey-steps";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/contexts/OnboardingContext";

interface JourneyStepItemProps {
  step: JourneyStep;
  completed: boolean;
  isCurrent: boolean;
  index: number;
}

export default function JourneyStepItem({
  step,
  completed,
  isCurrent,
  index,
}: JourneyStepItemProps) {
  const router = useRouter();
  const { completeStep, closeDrawer } = useOnboarding();
  const Icon = getStepIcon(step.icon);

  const handleNavigate = () => {
    if (step.href) {
      closeDrawer();
      router.push(step.href);
    }
  };

  return (
    <ListItem
      sx={{
        borderRadius: 2,
        mb: 0.5,
        px: 2,
        py: 1,
        bgcolor: isCurrent
          ? (theme) => alpha(theme.palette.success.main, 0.08)
          : "transparent",
        opacity: completed ? 0.7 : 1,
        transition: "all 0.2s ease",
        "&:hover": {
          bgcolor: (theme) => alpha(theme.palette.success.main, 0.04),
        },
      }}
      secondaryAction={
        completed ? (
          <Chip
            icon={<CheckCircleIcon />}
            label="Done"
            size="small"
            color="success"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        ) : isCurrent && step.href ? (
          <IconButton
            size="small"
            color="success"
            onClick={handleNavigate}
            sx={{
              bgcolor: (theme) => alpha(theme.palette.success.main, 0.12),
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.2),
              },
            }}
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        ) : null
      }
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        {completed ? (
          <CheckCircleIcon color="success" fontSize="small" />
        ) : (
          <Icon
            fontSize="small"
            sx={{
              color: isCurrent ? "success.main" : "text.secondary",
            }}
          />
        )}
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography
            variant="body2"
            fontWeight={isCurrent ? 600 : 400}
            sx={{
              textDecoration: completed ? "line-through" : "none",
              color: completed ? "text.secondary" : "text.primary",
            }}
          >
            {step.title}
          </Typography>
        }
        secondary={
          isCurrent ? (
            <Typography variant="caption" color="text.secondary">
              {step.description}
            </Typography>
          ) : null
        }
      />
    </ListItem>
  );
}
