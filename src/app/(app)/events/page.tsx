"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const NAVY = "#001E2B";
const GREEN = "#00ED64";
const DEEP = "#000D14";

interface Event {
  _id: string;
  name: string;
  description: string;
  theme: string;
  startDate: string;
  endDate: string;
  location: string;
  isVirtual: boolean;
  tags: string[];
  status: string;
  capacity: number;
  landingPage?: {
    slug?: string;
    published?: boolean;
  };
  isRegistered?: boolean;
}

const STATUS_FILTERS = [
  { value: "", label: "All Events" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "concluded", label: "Concluded" },
];

const statusMeta: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: "Open", color: GREEN, bg: "rgba(0,237,100,0.1)" },
  in_progress: { label: "In Progress", color: "#006EFF", bg: "rgba(0,110,255,0.1)" },
  concluded: { label: "Concluded", color: "rgba(255,255,255,0.35)", bg: "rgba(255,255,255,0.06)" },
  draft: { label: "Draft", color: "rgba(255,255,255,0.25)", bg: "rgba(255,255,255,0.05)" },
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      try {
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        const res = await fetch(`/api/events?${params.toString()}`);
        const data = await res.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [statusFilter]);

  return (
    <Box
      sx={{
        bgcolor: NAVY,
        minHeight: "100vh",
        color: "#E8EDEB",
        "@keyframes fadeUp": {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "@keyframes fadeIn": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
    >
      {/* Page header */}
      <Box
        sx={{
          bgcolor: DEEP,
          borderBottom: "1px solid rgba(255,255,255,0.055)",
          py: { xs: 6, md: 10 },
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage: `
              repeating-linear-gradient(
                -48deg,
                transparent,
                transparent 72px,
                rgba(0,237,100,0.025) 72px,
                rgba(0,237,100,0.025) 73px
              )
            `,
            pointerEvents: "none",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: "-30%",
            right: "-5%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(0,237,100,0.08) 0%, transparent 70%)`,
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            sx={{
              fontFamily: "'Source Code Pro', monospace",
              fontSize: "0.7rem",
              color: GREEN,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              mb: 2,
              animation: "fadeUp 0.5s ease both",
            }}
          >
            // Upcoming hackathons
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: "'Source Serif Pro', Georgia, serif",
              fontWeight: 700,
              fontSize: { xs: "2.5rem", md: "3.75rem" },
              letterSpacing: "-0.03em",
              color: "#F0F6F3",
              lineHeight: 1.05,
              mb: 2,
              animation: "fadeUp 0.5s ease 0.08s both",
            }}
          >
            Hackathon{" "}
            <Box component="span" sx={{ color: GREEN }}>
              Events
            </Box>
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.42)",
              fontSize: { xs: "0.95rem", md: "1.05rem" },
              animation: "fadeUp 0.5s ease 0.16s both",
            }}
          >
            Discover competitions, register your team, and build something extraordinary.
          </Typography>

          {/* Filter pills */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mt: 4,
              flexWrap: "wrap",
              animation: "fadeUp 0.5s ease 0.24s both",
            }}
          >
            {STATUS_FILTERS.map((f) => (
              <Box
                key={f.value}
                component="button"
                onClick={() => setStatusFilter(f.value)}
                sx={{
                  px: 2.25,
                  py: 0.75,
                  borderRadius: 99,
                  border: `1px solid ${statusFilter === f.value ? GREEN : "rgba(255,255,255,0.14)"}`,
                  bgcolor:
                    statusFilter === f.value
                      ? "rgba(0,237,100,0.1)"
                      : "rgba(255,255,255,0.04)",
                  color:
                    statusFilter === f.value
                      ? GREEN
                      : "rgba(255,255,255,0.55)",
                  fontSize: "0.825rem",
                  fontWeight: statusFilter === f.value ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  letterSpacing: "0.01em",
                  fontFamily: "inherit",
                  "&:hover": {
                    borderColor:
                      statusFilter === f.value ? GREEN : "rgba(255,255,255,0.3)",
                    color:
                      statusFilter === f.value ? GREEN : "rgba(255,255,255,0.8)",
                    bgcolor:
                      statusFilter === f.value
                        ? "rgba(0,237,100,0.14)"
                        : "rgba(255,255,255,0.07)",
                  },
                }}
              >
                {f.label}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Events grid */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 14,
            }}
          >
            <CircularProgress sx={{ color: GREEN }} />
          </Box>
        ) : events.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 14,
              animation: "fadeIn 0.4s ease both",
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Source Code Pro', monospace",
                fontSize: "2rem",
                color: "rgba(255,255,255,0.12)",
                mb: 2,
              }}
            >
              [ ]
            </Typography>
            <Typography
              sx={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.35)", mb: 1 }}
            >
              No events found
            </Typography>
            <Typography
              sx={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.2)" }}
            >
              Check back soon for upcoming hackathons.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 2.5,
            }}
          >
            {events.map((event, i) => {
              const meta = statusMeta[event.status] ?? statusMeta.draft;
              const canRegister =
                !event.isRegistered &&
                event.landingPage?.slug &&
                event.landingPage.published;

              return (
                <Box
                  key={event._id}
                  sx={{
                    position: "relative",
                    borderRadius: 3,
                    border: "1px solid rgba(255,255,255,0.06)",
                    bgcolor: "rgba(255,255,255,0.025)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    animation: `fadeUp 0.5s ease ${0.04 * i}s both`,
                    // Top accent stripe (hidden until hover)
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background:
                        event.status === "open"
                          ? GREEN
                          : event.status === "in_progress"
                            ? "#006EFF"
                            : "rgba(255,255,255,0.12)",
                      opacity: 0,
                      transition: "opacity 0.3s",
                    },
                    "&:hover": {
                      border: "1px solid rgba(255,255,255,0.12)",
                      bgcolor: "rgba(255,255,255,0.04)",
                      transform: "translateY(-4px)",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                      "&::before": { opacity: 1 },
                    },
                  }}
                >
                  {/* Card body */}
                  <Box sx={{ p: 3.5, flexGrow: 1 }}>
                    {/* Status + virtual badges */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2.5,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.6,
                          px: 1.25,
                          py: 0.375,
                          borderRadius: 99,
                          bgcolor: meta.bg,
                          border: `1px solid ${meta.color}30`,
                        }}
                      >
                        {event.status === "open" && (
                          <Box
                            sx={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              bgcolor: GREEN,
                              flexShrink: 0,
                              "@keyframes blinkDot": {
                                "0%, 100%": { opacity: 1 },
                                "50%": { opacity: 0.2 },
                              },
                              animation: "blinkDot 1.6s ease-in-out infinite",
                            }}
                          />
                        )}
                        <Typography
                          sx={{
                            fontFamily: "'Source Code Pro', monospace",
                            fontSize: "0.68rem",
                            color: meta.color,
                            fontWeight: 600,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          {meta.label}
                        </Typography>
                      </Box>
                      {event.isVirtual && (
                        <Chip
                          label="Virtual"
                          size="small"
                          sx={{
                            bgcolor: "rgba(255,255,255,0.05)",
                            color: "rgba(255,255,255,0.45)",
                            borderColor: "rgba(255,255,255,0.1)",
                            border: "1px solid",
                            fontSize: "0.68rem",
                            height: 22,
                            fontWeight: 500,
                          }}
                        />
                      )}
                    </Box>

                    {/* Event name */}
                    <Typography
                      sx={{
                        fontFamily: "'Source Serif Pro', Georgia, serif",
                        fontWeight: 700,
                        fontSize: { xs: "1.15rem", md: "1.25rem" },
                        color: "#F0F6F3",
                        lineHeight: 1.25,
                        mb: 1.5,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {event.name}
                    </Typography>

                    {/* Description */}
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.38)",
                        fontSize: "0.85rem",
                        lineHeight: 1.65,
                        mb: 3,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {event.description}
                    </Typography>

                    {/* Meta row */}
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 0.875 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <CalendarTodayIcon
                          sx={{ fontSize: 13, color: "rgba(255,255,255,0.28)" }}
                        />
                        <Typography
                          sx={{
                            fontSize: "0.78rem",
                            color: "rgba(255,255,255,0.38)",
                            fontFamily: "'Source Code Pro', monospace",
                          }}
                        >
                          {new Date(event.startDate).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <LocationOnIcon
                          sx={{ fontSize: 13, color: "rgba(255,255,255,0.28)" }}
                        />
                        <Typography
                          sx={{
                            fontSize: "0.78rem",
                            color: "rgba(255,255,255,0.38)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {event.isVirtual ? "Virtual Event" : event.location}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Card footer */}
                  <Box
                    sx={{
                      px: 3.5,
                      pb: 3.5,
                      pt: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTop: "1px solid rgba(255,255,255,0.055)",
                      mt: "auto",
                      gap: 1,
                    }}
                  >
                    <Box
                      component="a"
                      href={`/events/${event._id}`}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: "rgba(255,255,255,0.38)",
                        fontSize: "0.82rem",
                        fontWeight: 500,
                        textDecoration: "none",
                        transition: "color 0.18s ease",
                        "&:hover": { color: "rgba(255,255,255,0.75)" },
                      }}
                    >
                      Details
                      <ArrowForwardIcon sx={{ fontSize: 14 }} />
                    </Box>

                    {event.isRegistered ? (
                      <Box
                        component="a"
                        href={`/events/${event._id}`}
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.75,
                          px: 2,
                          py: 0.625,
                          borderRadius: 99,
                          border: `1px solid rgba(0,237,100,0.3)`,
                          bgcolor: "rgba(0,237,100,0.08)",
                          color: GREEN,
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          textDecoration: "none",
                          transition: "all 0.18s ease",
                          "&:hover": {
                            bgcolor: "rgba(0,237,100,0.14)",
                            borderColor: GREEN,
                          },
                        }}
                      >
                        <CheckCircleIcon sx={{ fontSize: 14 }} />
                        Registered
                      </Box>
                    ) : canRegister ? (
                      <Box
                        component="a"
                        href={`/${event.landingPage!.slug}`}
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.75,
                          px: 2.25,
                          py: 0.75,
                          borderRadius: 99,
                          bgcolor: GREEN,
                          color: NAVY,
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          textDecoration: "none",
                          boxShadow: "0 0 16px rgba(0,237,100,0.25)",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "#2FF87A",
                            boxShadow: "0 0 28px rgba(0,237,100,0.45)",
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        Register
                        <ArrowForwardIcon sx={{ fontSize: 13 }} />
                      </Box>
                    ) : null}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
}
