"use client";

import { Card, CardContent, Box, Typography, Button, Chip } from "@mui/material";
import {
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon,
  Group as GroupIcon,
  Code as CodeIcon,
  Send as SendIcon,
  Gavel as GavelIcon,
  EmojiEvents as TrophyIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NextStepsSectionProps {
  nextMilestone: {
    title: string;
    description: string;
    deadline: string | null;
    action: string;
    priority: string;
    icon: string;
  };
  eventId: string;
  participantStatus: {
    registered: boolean;
    hasTeam: boolean;
    hasProject: boolean;
    projectSubmitted: boolean;
  };
}

function getIcon(iconName: string) {
  const icons: Record<string, any> = {
    group: GroupIcon,
    code: CodeIcon,
    send: SendIcon,
    gavel: GavelIcon,
    emoji_events: TrophyIcon,
    schedule: ScheduleIcon,
    check_circle: CheckIcon,
  };
  return icons[iconName] || CheckIcon;
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "success";
    default:
      return "info";
  }
}

function getActionUrl(action: string, eventId: string) {
  switch (action) {
    case "browse-teams":
      return `#browse-teams`;
    case "create-project":
      return `/events/${eventId}/projects/new`;
    case "submit-project":
      return `#your-project`;
    case "edit-project":
      return `#your-project`;
    case "view-project":
      return `#your-project`;
    case "view-resources":
      return `#resources`;
    case "view-results":
      return `/events/${eventId}/results`;
    default:
      return "#";
  }
}

function getActionLabel(action: string) {
  switch (action) {
    case "browse-teams":
      return "Browse Teams";
    case "create-project":
      return "Create Project";
    case "submit-project":
      return "Submit Project";
    case "edit-project":
      return "Edit Project";
    case "view-project":
      return "View Project";
    case "view-resources":
      return "View Resources";
    case "view-results":
      return "View Results";
    default:
      return "View Details";
  }
}

function formatDeadline(deadline: string | null) {
  if (!deadline) return null;

  const date = new Date(deadline);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 7) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (days > 0) {
    return `in ${days} day${days > 1 ? "s" : ""}`;
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) {
    return `in ${hours} hour${hours > 1 ? "s" : ""}`;
  }

  return "Today";
}

export default function NextStepsSection({
  nextMilestone,
  eventId,
  participantStatus,
}: NextStepsSectionProps) {
  const router = useRouter();
  const Icon = getIcon(nextMilestone.icon);
  const priorityColor = getPriorityColor(nextMilestone.priority);
  const actionUrl = getActionUrl(nextMilestone.action, eventId);
  const actionLabel = getActionLabel(nextMilestone.action);
  const deadlineText = formatDeadline(nextMilestone.deadline);

  const handleAction = () => {
    if (actionUrl.startsWith("#")) {
      // Smooth scroll to section
      const element = document.querySelector(actionUrl);
      element?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(actionUrl);
    }
  };

  return (
    <Card
      elevation={3}
      sx={{
        borderLeft: `6px solid`,
        borderLeftColor: `${priorityColor}.main`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: `${priorityColor}.light`,
              color: `${priorityColor}.main`,
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 32 }} />
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {nextMilestone.title}
              </Typography>
              {nextMilestone.priority === "high" && (
                <Chip
                  label="Action Needed"
                  size="small"
                  color="error"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Box>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: deadlineText ? 2 : 3 }}
            >
              {nextMilestone.description}
            </Typography>

            {deadlineText && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <ScheduleIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Deadline:</strong> {deadlineText}
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              color={priorityColor as any}
              endIcon={<ArrowIcon />}
              onClick={handleAction}
              size="large"
            >
              {actionLabel}
            </Button>
          </Box>
        </Box>

        {/* Progress Checklist */}
        <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Your Progress:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckIcon sx={{ fontSize: 20, color: "success.main" }} />
              <Typography variant="body2">Registered</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {participantStatus.hasTeam ? (
                <CheckIcon sx={{ fontSize: 20, color: "success.main" }} />
              ) : (
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    border: 2,
                    borderColor: "text.disabled",
                  }}
                />
              )}
              <Typography
                variant="body2"
                color={participantStatus.hasTeam ? "text.primary" : "text.disabled"}
              >
                Joined Team
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {participantStatus.projectSubmitted ? (
                <CheckIcon sx={{ fontSize: 20, color: "success.main" }} />
              ) : (
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    border: 2,
                    borderColor: "text.disabled",
                  }}
                />
              )}
              <Typography
                variant="body2"
                color={participantStatus.projectSubmitted ? "text.primary" : "text.disabled"}
              >
                Submitted Project
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
