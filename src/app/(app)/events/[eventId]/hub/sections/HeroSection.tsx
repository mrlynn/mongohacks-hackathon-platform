"use client";

import { Box, Container, Typography, Chip, LinearProgress } from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  RadioButtonUnchecked as UncheckedIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material";
import { mongoColors } from "@/styles/theme";

interface HeroSectionProps {
  event: any;
  currentPhase: {
    name: string;
    progress: number;
    color: string;
  };
  participantStatus: {
    registered: boolean;
    hasTeam: boolean;
    hasProject: boolean;
    projectSubmitted: boolean;
  };
}

function formatCountdown(targetDate: string) {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();

  if (diff < 0) {
    return "In progress";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""}, ${hours} hour${hours > 1 ? "s" : ""}`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }

  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${minutes} minute${minutes > 1 ? "s" : ""}`;
}

export default function HeroSection({
  event,
  currentPhase,
  participantStatus,
}: HeroSectionProps) {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const eventStarted = now >= startDate;

  const countdown = eventStarted
    ? formatCountdown(event.endDate)
    : formatCountdown(event.startDate);

  const countdownLabel = eventStarted ? "Event Ends In:" : "Event Starts In:";

  const backgroundImage = event.landingPage?.backgroundImage;

  return (
    <Box
      sx={{
        background: backgroundImage
          ? `linear-gradient(rgba(0, 104, 74, 0.85), rgba(0, 30, 43, 0.85)), url(${backgroundImage})`
          : `linear-gradient(135deg, ${mongoColors.green.main} 0%, ${mongoColors.blue.main} 100%)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
        py: { xs: 4, md: 6 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg">
        {/* Event Name */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <TrophyIcon sx={{ fontSize: { xs: 32, md: 40 } }} />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
            }}
          >
            {event.name}
          </Typography>
        </Box>

        {/* Countdown */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            sx={{ opacity: 0.9, mb: 0.5, textTransform: "uppercase", letterSpacing: 1 }}
          >
            {countdownLabel}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
            }}
          >
            {countdown}
          </Typography>
        </Box>

        {/* Current Phase */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 1,
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.9, textTransform: "uppercase", letterSpacing: 1 }}>
              Current Phase:
            </Typography>
            <Chip
              label={currentPhase.name}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={currentPhase.progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "rgba(255, 255, 255, 0.2)",
              "& .MuiLinearProgress-bar": {
                bgcolor: "white",
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {/* Participant Status */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckIcon sx={{ fontSize: 20 }} />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Registered
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {participantStatus.hasTeam ? (
              <>
                <CheckIcon sx={{ fontSize: 20 }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  On a Team
                </Typography>
              </>
            ) : (
              <>
                <WarningIcon sx={{ fontSize: 20 }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  No Team
                </Typography>
              </>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {participantStatus.projectSubmitted ? (
              <>
                <CheckIcon sx={{ fontSize: 20 }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Project Submitted
                </Typography>
              </>
            ) : participantStatus.hasProject ? (
              <>
                <WarningIcon sx={{ fontSize: 20 }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Project Draft
                </Typography>
              </>
            ) : (
              <>
                <UncheckedIcon sx={{ fontSize: 20 }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  No Project
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
