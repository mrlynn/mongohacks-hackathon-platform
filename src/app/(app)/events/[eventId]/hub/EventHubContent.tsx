"use client";

import { Box, Container } from "@mui/material";
import { ToastProvider } from "@/contexts/ToastContext";
import HeroSection from "./sections/HeroSection";
import NextStepsSection from "./sections/NextStepsSection";
import YourTeamSection from "./sections/YourTeamSection";
import YourProjectSection from "./sections/YourProjectSection";
import EventResourcesSection from "./sections/EventResourcesSection";
import BrowseTeamsSection from "./sections/BrowseTeamsSection";

interface EventHubContentProps {
  data: any;
  eventId: string;
}

export default function EventHubContent({ data, eventId }: EventHubContentProps) {
  const {
    event,
    participant,
    team,
    project,
    recommendedTeams,
    nextMilestone,
    upcomingSchedule,
    currentPhase,
    participantStatus,
  } = data;

  return (
    <ToastProvider>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
        {/* Hero Banner */}
        <HeroSection
          event={event}
          currentPhase={currentPhase}
          participantStatus={participantStatus}
        />

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Next Steps */}
            <NextStepsSection
              nextMilestone={nextMilestone}
              eventId={eventId}
              participantStatus={participantStatus}
            />

            {/* Your Team (if joined) */}
            {team && (
              <YourTeamSection
                team={team}
                eventId={eventId}
                participant={participant}
              />
            )}

            {/* Your Project (if created) */}
            {project && (
              <YourProjectSection
                project={project}
                team={team}
                eventId={eventId}
              />
            )}

            {/* Event Resources */}
            <EventResourcesSection
              event={event}
              upcomingSchedule={upcomingSchedule}
            />

            {/* Browse Teams (if not joined) */}
            {!team && recommendedTeams && recommendedTeams.length > 0 && (
              <BrowseTeamsSection
                recommendedTeams={recommendedTeams}
                eventId={eventId}
              />
            )}
          </Box>
        </Container>
      </Box>
    </ToastProvider>
  );
}
