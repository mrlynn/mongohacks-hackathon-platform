"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Collapse,
  IconButton,
  Chip,
  Link as MuiLink,
} from "@mui/material";
import {
  ExpandMore as ExpandIcon,
  MenuBook as ResourcesIcon,
  Schedule as ScheduleIcon,
  EmojiEvents as TrophyIcon,
  Gavel as JudgeIcon,
  Code as CodeIcon,
  Forum as DiscordIcon,
  FiberManualRecord as LiveIcon,
} from "@mui/icons-material";

interface EventResourcesSectionProps {
  event: any;
  upcomingSchedule: any[];
}

function isCurrentlyHappening(start: string, end: string) {
  const now = new Date();
  return now >= new Date(start) && now <= new Date(end);
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default function EventResourcesSection({
  event,
  upcomingSchedule,
}: EventResourcesSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card elevation={2} id="resources">
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            cursor: "pointer",
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <ResourcesIcon sx={{ fontSize: 28, color: "info.main" }} />
          <Typography variant="h5" sx={{ fontWeight: 600, flexGrow: 1 }}>
            Event Resources
          </Typography>
          <IconButton
            size="small"
            sx={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s",
            }}
          >
            <ExpandIcon />
          </IconButton>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 3 }}>
            {/* Upcoming Schedule */}
            {upcomingSchedule && upcomingSchedule.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <ScheduleIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Upcoming Schedule
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {upcomingSchedule.map((item: any, index: number) => {
                    const isLive = isCurrentlyHappening(item.start, item.end);
                    return (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          bgcolor: isLive ? "success.light" : "grey.50",
                          borderRadius: 1,
                          borderLeft: 4,
                          borderLeftColor: isLive ? "success.main" : "divider",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatDate(item.start)}
                          </Typography>
                          {isLive && (
                            <Chip
                              icon={<LiveIcon sx={{ fontSize: 12 }} />}
                              label="LIVE NOW"
                              size="small"
                              color="success"
                              sx={{ height: 20, fontSize: "0.7rem" }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {formatTime(item.start)} - {formatTime(item.end)}
                        </Typography>
                        <Typography variant="body1">{item.title}</Typography>
                        {item.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {item.description}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Prizes */}
            {event.prizes && event.prizes.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <TrophyIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Prizes
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {event.prizes.slice(0, 5).map((prize: any) => (
                    <Box
                      key={prize._id}
                      sx={{
                        p: 2,
                        bgcolor: "grey.50",
                        borderRadius: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {prize.name}
                        </Typography>
                        {prize.category && (
                          <Typography variant="caption" color="text.secondary">
                            {prize.category}
                          </Typography>
                        )}
                      </Box>
                      {prize.value && (
                        <Chip
                          label={`$${prize.value.toLocaleString()}`}
                          color="primary"
                          size="small"
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Judges */}
            {event.judges && event.judges.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <JudgeIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Judges ({event.judges.length})
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  View judge profiles and expertise on the event details page.
                </Typography>
              </Box>
            )}

            {/* Developer Resources */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <CodeIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Developer Resources
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <MuiLink
                  href="https://www.mongodb.com/docs/atlas/getting-started/"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                >
                  <Typography variant="body2">• MongoDB Atlas Documentation</Typography>
                </MuiLink>
                <MuiLink
                  href="https://www.mongodb.com/docs/atlas/atlas-vector-search/"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                >
                  <Typography variant="body2">• Vector Search Guide</Typography>
                </MuiLink>
                <MuiLink
                  href="https://github.com/mongodb"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                >
                  <Typography variant="body2">• Starter Templates (GitHub)</Typography>
                </MuiLink>
              </Box>
            </Box>

            {/* Community */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <DiscordIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Community
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Join the event community to ask questions, share progress, and connect with other
                participants.
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip
                  label="Join Discord"
                  component="a"
                  href="#"
                  clickable
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label="Event Hashtag: #{event.name?.replace(/\s+/g, '') || 'hackathon'}"
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
