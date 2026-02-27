"use client";

import { Box, Container, Typography, Button, Stack, Chip } from "@mui/material";
import {
  Event as EventIcon,
  People as PeopleIcon,
  Folder as FolderIcon,
  Map as MapIcon,
  AdminPanelSettings as AdminIcon,
  ArrowForward as ArrowIcon,
  GitHub as GitHubIcon,
  Launch as LaunchIcon,
  Collections as GalleryIcon,
} from "@mui/icons-material";

// MongoDB brand tokens
const NAVY = "#001E2B";
const GREEN = "#00ED64";
const FOREST = "#00684A";
const DEEP = "#000D14";

interface User {
  name?: string;
  email?: string;
  role?: string;
}

interface FeaturedProject {
  _id: string;
  name: string;
  description: string;
  category: string;
  technologies: string[];
  thumbnailUrl?: string;
  repoUrl: string;
  demoUrl?: string;
  eventId: { _id: string; name: string } | string;
  teamId: { _id: string; name: string } | string;
}

const features = [
  {
    icon: EventIcon,
    title: "Discover Events",
    body: "Browse hackathons worldwide with rich details and instant one-click registration.",
    href: "/events",
    accent: GREEN,
    rgb: "0,237,100",
  },
  {
    icon: PeopleIcon,
    title: "Form Teams",
    body: "Find teammates with complementary skills and collaborate in real time.",
    href: "/events",
    accent: "#006EFF",
    rgb: "0,110,255",
  },
  {
    icon: FolderIcon,
    title: "Submit Projects",
    body: "Showcase your work with a polished submission and receive expert feedback.",
    href: "/projects",
    accent: "#B45AF2",
    rgb: "180,90,242",
  },
  {
    icon: MapIcon,
    title: "World Map",
    body: "Visualize hackathons globally and find events near you — or go fully remote.",
    href: "/events/map",
    accent: "#FFC010",
    rgb: "255,192,16",
  },
];

const adminLinks = [
  { label: "Create Event", href: "/admin/events/new" },
  { label: "Manage Users", href: "/admin/users" },
  { label: "View Projects", href: "/admin/projects" },
  { label: "Admin Dashboard", href: "/admin" },
];

const whyItems = [
  {
    icon: "⚡",
    label: "48-hour sprints",
    desc: "Intensive hackathons designed to take an idea from zero to shipped product.",
  },
  {
    icon: "🏆",
    label: "Real prizes",
    desc: "Cash awards, Atlas credits, and direct mentorship from MongoDB engineers.",
  },
  {
    icon: "🌍",
    label: "Global community",
    desc: "Connect with developers worldwide — both in-person and fully virtual formats.",
  },
];

export default function HomePageClient({
  user,
  featuredProjects = [],
}: {
  user: User | null;
  featuredProjects?: FeaturedProject[];
}) {
  const isAdmin =
    user?.role === "admin" ||
    user?.role === "super_admin" ||
    user?.role === "organizer";

  return (
    <Box
      sx={{
        bgcolor: NAVY,
        minHeight: "100vh",
        color: "#E8EDEB",
        // Define keyframes globally for this subtree
        "@keyframes pulseOrb": {
          "0%, 100%": { transform: "scale(1)", opacity: 0.7 },
          "50%": { transform: "scale(1.12)", opacity: 1 },
        },
        "@keyframes floatOrb": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-28px)" },
        },
        "@keyframes fadeSlideUp": {
          from: { opacity: 0, transform: "translateY(28px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "@keyframes fadeSlideDown": {
          from: { opacity: 0, transform: "translateY(-16px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "@keyframes blink": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.15 },
        },
        "@keyframes scrollBounce": {
          "0%, 100%": { transform: "translateX(-50%) translateY(0)" },
          "50%": { transform: "translateX(-50%) translateY(10px)" },
        },
        "@keyframes shimmer": {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
      }}
    >
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          bgcolor: NAVY,
          // Diagonal stripe texture
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
          // Bottom fade
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 160,
            background: `linear-gradient(to bottom, transparent, ${NAVY})`,
            pointerEvents: "none",
          },
        }}
      >
        {/* Glow orb — top right */}
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            width: { xs: 320, md: 560 },
            height: { xs: 320, md: 560 },
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(0,237,100,0.13) 0%, transparent 70%)`,
            top: "-15%",
            right: "-8%",
            pointerEvents: "none",
            animation: "pulseOrb 7s ease-in-out infinite",
          }}
        />
        {/* Glow orb — bottom left */}
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            width: { xs: 240, md: 400 },
            height: { xs: 240, md: 400 },
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(0,104,74,0.22) 0%, transparent 70%)`,
            bottom: "-8%",
            left: "8%",
            pointerEvents: "none",
            animation: "floatOrb 9s ease-in-out infinite",
          }}
        />

        <Container
          maxWidth="lg"
          sx={{ position: "relative", zIndex: 1, py: { xs: 12, md: 18 } }}
        >
          {/* Eyebrow pill */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1.25,
              px: 2,
              py: 0.875,
              mb: 5,
              borderRadius: 99,
              border: `1px solid rgba(0,237,100,0.28)`,
              bgcolor: "rgba(0,237,100,0.07)",
              animation: "fadeSlideDown 0.55s ease both",
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: GREEN,
                flexShrink: 0,
                animation: "blink 1.6s ease-in-out infinite",
              }}
            />
            <Typography
              sx={{
                fontFamily: "'Source Code Pro', monospace",
                fontSize: "0.7rem",
                color: GREEN,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              MongoDB Hackathon Platform
            </Typography>
          </Box>

          {/* Main headline */}
          <Typography
            component="h1"
            sx={{
              fontFamily: "'Source Serif Pro', Georgia, serif",
              fontWeight: 700,
              fontSize: { xs: "3.25rem", sm: "5rem", md: "6.5rem", lg: "8rem" },
              lineHeight: 0.95,
              letterSpacing: "-0.035em",
              color: "#F0F6F3",
              mb: 4,
              animation: "fadeSlideUp 0.65s ease 0.1s both",
            }}
          >
            Build.{" "}
            <Box
              component="span"
              sx={{
                color: GREEN,
                position: "relative",
                display: "inline-block",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: "0.06em",
                  height: "0.055em",
                  background: `linear-gradient(90deg, ${GREEN} 0%, rgba(0,237,100,0.3) 100%)`,
                  borderRadius: 4,
                },
              }}
            >
              Ship.
            </Box>
            <br />
            Win.
          </Typography>

          {/* Subheadline */}
          <Typography
            sx={{
              fontSize: { xs: "1.05rem", md: "1.3rem" },
              color: "rgba(255,255,255,0.5)",
              maxWidth: 520,
              lineHeight: 1.65,
              mb: 5,
              fontWeight: 400,
              animation: "fadeSlideUp 0.65s ease 0.2s both",
            }}
          >
            {user
              ? `Welcome back, ${user.name?.split(" ")[0] ?? "hacker"}. Your next breakthrough starts here.`
              : "Discover hackathons, form killer teams, and ship projects that matter — all powered by MongoDB Atlas."}
          </Typography>

          {/* CTA row */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ animation: "fadeSlideUp 0.65s ease 0.32s both" }}
          >
            {user ? (
              <>
                <Button
                  variant="contained"
                  size="large"
                  href="/dashboard"
                  endIcon={<ArrowIcon />}
                  sx={{
                    bgcolor: GREEN,
                    color: NAVY,
                    fontWeight: 700,
                    fontSize: "0.975rem",
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: `0 0 32px rgba(0,237,100,0.32)`,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "#2FF87A",
                      boxShadow: `0 0 52px rgba(0,237,100,0.55)`,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Go to Dashboard
                </Button>
                {isAdmin && (
                  <Button
                    variant="outlined"
                    size="large"
                    href="/admin"
                    startIcon={<AdminIcon />}
                    sx={{
                      borderColor: "rgba(255,255,255,0.18)",
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: 600,
                      fontSize: "0.975rem",
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: "rgba(255,255,255,0.45)",
                        bgcolor: "rgba(255,255,255,0.05)",
                        color: "white",
                      },
                    }}
                  >
                    Admin Console
                  </Button>
                )}
                <Button
                  variant="text"
                  size="large"
                  href="/events"
                  sx={{
                    color: "rgba(255,255,255,0.45)",
                    fontWeight: 500,
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: "rgba(255,255,255,0.8)",
                      bgcolor: "rgba(255,255,255,0.04)",
                    },
                  }}
                >
                  Browse Events →
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  href="/register"
                  endIcon={<ArrowIcon />}
                  sx={{
                    bgcolor: GREEN,
                    color: NAVY,
                    fontWeight: 700,
                    fontSize: "0.975rem",
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: `0 0 32px rgba(0,237,100,0.32)`,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "#2FF87A",
                      boxShadow: `0 0 52px rgba(0,237,100,0.55)`,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  href="/events"
                  sx={{
                    borderColor: "rgba(255,255,255,0.18)",
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 600,
                    fontSize: "0.975rem",
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.45)",
                      bgcolor: "rgba(255,255,255,0.05)",
                      color: "white",
                    },
                  }}
                >
                  Browse Events
                </Button>
              </>
            )}
          </Stack>

          {/* Stats row */}
          <Box
            sx={{
              display: "flex",
              gap: { xs: 4, md: 6 },
              mt: { xs: 7, md: 10 },
              pt: { xs: 5, md: 7 },
              borderTop: "1px solid rgba(255,255,255,0.07)",
              flexWrap: "wrap",
              animation: "fadeSlideUp 0.65s ease 0.48s both",
            }}
          >
            {[
              { value: "50+", label: "Events Hosted" },
              { value: "2K+", label: "Participants" },
              { value: "400+", label: "Projects Built" },
            ].map(({ value, label }) => (
              <Box key={label}>
                <Typography
                  sx={{
                    fontFamily: "'Source Code Pro', monospace",
                    fontSize: { xs: "1.9rem", md: "2.6rem" },
                    fontWeight: 700,
                    color: GREEN,
                    lineHeight: 1,
                  }}
                >
                  {value}
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.35)",
                    fontSize: "0.72rem",
                    mt: 0.75,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontFamily: "'Source Code Pro', monospace",
                  }}
                >
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>

        {/* Scroll indicator */}
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            bottom: 28,
            left: "50%",
            animation: "scrollBounce 2.2s ease-in-out infinite",
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              width: 1.5,
              height: 36,
              borderRadius: 2,
              background: `linear-gradient(to bottom, transparent, rgba(255,255,255,0.25))`,
            }}
          />
        </Box>
      </Box>

      {/* ─── FEATURES ──────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: DEEP, py: { xs: 10, md: 16 } }}>
        <Container maxWidth="lg">
          {/* Section header */}
          <Box sx={{ mb: { xs: 7, md: 10 }, maxWidth: 620 }}>
            <Typography
              sx={{
                fontFamily: "'Source Code Pro', monospace",
                fontSize: "0.7rem",
                color: GREEN,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                mb: 2,
              }}
            >
              // Platform capabilities
            </Typography>
            <Typography
              component="h2"
              sx={{
                fontFamily: "'Source Serif Pro', Georgia, serif",
                fontWeight: 700,
                fontSize: { xs: "2.25rem", md: "3.25rem" },
                letterSpacing: "-0.025em",
                color: "#F0F6F3",
                lineHeight: 1.1,
              }}
            >
              Everything you need to{" "}
              <Box component="span" sx={{ color: GREEN }}>
                run
              </Box>{" "}
              a hackathon
            </Typography>
          </Box>

          {/* 2 × 2 feature bento */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Box
                  key={f.title}
                  component="a"
                  href={f.href}
                  sx={{
                    p: { xs: 3.5, md: 5 },
                    borderRadius: 3,
                    border: "1px solid rgba(255,255,255,0.055)",
                    bgcolor: "rgba(255,255,255,0.028)",
                    textDecoration: "none",
                    color: "inherit",
                    display: "block",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    // Top accent bar (hidden until hover)
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: f.accent,
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    },
                    // Corner glow (hidden until hover)
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: -60,
                      right: -60,
                      width: 160,
                      height: 160,
                      borderRadius: "50%",
                      background: `radial-gradient(circle, rgba(${f.rgb},0.18) 0%, transparent 70%)`,
                      opacity: 0,
                      transition: "opacity 0.4s ease",
                      pointerEvents: "none",
                    },
                    "&:hover": {
                      border: `1px solid rgba(${f.rgb},0.22)`,
                      bgcolor: `rgba(${f.rgb},0.04)`,
                      transform: "translateY(-5px)",
                      boxShadow: `0 16px 48px rgba(0,0,0,0.35)`,
                      "&::before": { opacity: 1 },
                      "&::after": { opacity: 1 },
                      "& .feat-icon-wrap": {
                        transform: "scale(1.08)",
                        bgcolor: `rgba(${f.rgb},0.22)`,
                      },
                      "& .feat-arrow": { opacity: 1, transform: "translateX(0)" },
                    },
                  }}
                >
                  {/* Icon */}
                  <Box
                    className="feat-icon-wrap"
                    sx={{
                      width: 54,
                      height: 54,
                      borderRadius: 2.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: `rgba(${f.rgb},0.13)`,
                      mb: 3.5,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Icon sx={{ fontSize: 27, color: f.accent }} />
                  </Box>

                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.15rem",
                      color: "#F0F6F3",
                      mb: 1.25,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {f.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "0.88rem",
                      lineHeight: 1.65,
                    }}
                  >
                    {f.body}
                  </Typography>

                  {/* Arrow CTA */}
                  <Box
                    className="feat-arrow"
                    sx={{
                      mt: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      opacity: 0,
                      transform: "translateX(-6px)",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <Typography sx={{ fontSize: "0.82rem", color: f.accent, fontWeight: 600 }}>
                      Learn more
                    </Typography>
                    <ArrowIcon sx={{ fontSize: 14, color: f.accent }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Container>
      </Box>

      {/* ─── WHY SECTION ──────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: NAVY,
          py: { xs: 10, md: 16 },
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: { xs: 7, md: 14 },
              alignItems: "center",
            }}
          >
            {/* Left copy */}
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Source Code Pro', monospace",
                  fontSize: "0.7rem",
                  color: GREEN,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  mb: 2,
                }}
              >
                // Why MongoDB hackathons
              </Typography>
              <Typography
                component="h2"
                sx={{
                  fontFamily: "'Source Serif Pro', Georgia, serif",
                  fontWeight: 700,
                  fontSize: { xs: "2.1rem", md: "3rem" },
                  letterSpacing: "-0.025em",
                  color: "#F0F6F3",
                  lineHeight: 1.15,
                  mb: 3.5,
                }}
              >
                The platform built{" "}
                <Box component="span" sx={{ color: GREEN }}>
                  for builders
                </Box>
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: "1rem",
                  lineHeight: 1.8,
                  mb: 4.5,
                  maxWidth: 440,
                }}
              >
                From idea to shipped product in 48 hours. We handle all the logistics
                so you can focus on what matters — building something extraordinary
                with MongoDB Atlas.
              </Typography>
              <Button
                variant="outlined"
                size="large"
                href="/events"
                endIcon={<ArrowIcon />}
                sx={{
                  borderColor: GREEN,
                  color: GREEN,
                  fontWeight: 600,
                  px: 3.5,
                  py: 1.25,
                  borderRadius: 2,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(0,237,100,0.07)",
                    borderColor: "#2FF87A",
                    boxShadow: `0 0 20px rgba(0,237,100,0.2)`,
                  },
                }}
              >
                Explore Upcoming Events
              </Button>
            </Box>

            {/* Right pills */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {whyItems.map(({ icon, label, desc }, i) => (
                <Box
                  key={label}
                  sx={{
                    display: "flex",
                    gap: 3,
                    p: { xs: 3, md: 3.5 },
                    borderRadius: 2.5,
                    border: "1px solid rgba(255,255,255,0.055)",
                    bgcolor: "rgba(255,255,255,0.02)",
                    transition: "all 0.25s ease",
                    "&:hover": {
                      borderColor: "rgba(0,237,100,0.22)",
                      bgcolor: "rgba(0,237,100,0.03)",
                      transform: "translateX(4px)",
                    },
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  <Typography sx={{ fontSize: "1.8rem", lineHeight: 1, flexShrink: 0 }}>
                    {icon}
                  </Typography>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: "#F0F6F3",
                        mb: 0.5,
                        fontSize: "0.975rem",
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.42)",
                        fontSize: "0.85rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ─── FEATURED PROJECTS ─────────────────────────────────────────── */}
      {featuredProjects.length > 0 && (
        <Box
          sx={{
            bgcolor: DEEP,
            py: { xs: 10, md: 16 },
            borderTop: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", md: "flex-end" },
                flexDirection: { xs: "column", md: "row" },
                gap: 3,
                mb: { xs: 6, md: 8 },
              }}
            >
              <Box sx={{ maxWidth: 560 }}>
                <Typography
                  sx={{
                    fontFamily: "'Source Code Pro', monospace",
                    fontSize: "0.7rem",
                    color: GREEN,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    mb: 2,
                  }}
                >
                  // Featured projects
                </Typography>
                <Typography
                  component="h2"
                  sx={{
                    fontFamily: "'Source Serif Pro', Georgia, serif",
                    fontWeight: 700,
                    fontSize: { xs: "2.1rem", md: "3rem" },
                    letterSpacing: "-0.025em",
                    color: "#F0F6F3",
                    lineHeight: 1.15,
                  }}
                >
                  Built at{" "}
                  <Box component="span" sx={{ color: GREEN }}>
                    MongoDB Hackathons
                  </Box>
                </Typography>
              </Box>
              <Button
                variant="outlined"
                href="/gallery"
                endIcon={<ArrowIcon />}
                sx={{
                  borderColor: "rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: GREEN,
                    color: GREEN,
                    bgcolor: "rgba(0,237,100,0.06)",
                  },
                }}
              >
                View All Projects
              </Button>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: 2.5,
              }}
            >
              {featuredProjects.slice(0, 4).map((project) => {
                const teamName =
                  typeof project.teamId === "object"
                    ? project.teamId.name
                    : undefined;
                const eventName =
                  typeof project.eventId === "object"
                    ? project.eventId.name
                    : undefined;
                const eventIdStr =
                  typeof project.eventId === "object"
                    ? project.eventId._id
                    : project.eventId;

                return (
                  <Box
                    key={project._id}
                    component="a"
                    href={`/gallery`}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid rgba(255,255,255,0.06)",
                      bgcolor: "rgba(255,255,255,0.025)",
                      overflow: "hidden",
                      textDecoration: "none",
                      color: "inherit",
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        border: "1px solid rgba(0,237,100,0.2)",
                        bgcolor: "rgba(0,237,100,0.03)",
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
                      },
                    }}
                  >
                    {/* Thumbnail */}
                    <Box
                      sx={{
                        height: 160,
                        bgcolor: "rgba(255,255,255,0.04)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      {project.thumbnailUrl ? (
                        <Box
                          component="img"
                          src={project.thumbnailUrl}
                          alt={project.name}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <FolderIcon
                            sx={{
                              fontSize: 40,
                              color: "rgba(255,255,255,0.12)",
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: "0.7rem",
                              color: "rgba(255,255,255,0.2)",
                              fontFamily: "'Source Code Pro', monospace",
                            }}
                          >
                            {project.category}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Content */}
                    <Box sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column" }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: "#F0F6F3",
                          mb: 0.75,
                          lineHeight: 1.3,
                        }}
                      >
                        {project.name}
                      </Typography>
                      {teamName && (
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            color: "rgba(255,255,255,0.35)",
                            mb: 1.5,
                          }}
                        >
                          by {teamName}
                        </Typography>
                      )}
                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.4)",
                          lineHeight: 1.55,
                          mb: 2,
                          flex: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {project.description}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          flexWrap: "wrap",
                        }}
                      >
                        {project.technologies.slice(0, 3).map((tech) => (
                          <Chip
                            key={tech}
                            label={tech}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.65rem",
                              bgcolor: "rgba(255,255,255,0.06)",
                              color: "rgba(255,255,255,0.5)",
                              border: "none",
                            }}
                          />
                        ))}
                        {project.technologies.length > 3 && (
                          <Chip
                            label={`+${project.technologies.length - 3}`}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.65rem",
                              bgcolor: "rgba(255,255,255,0.04)",
                              color: "rgba(255,255,255,0.35)",
                              border: "none",
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Container>
        </Box>
      )}

      {/* ─── ADMIN QUICK LINKS ────────────────────────────────────────── */}
      {isAdmin && (
        <Box
          sx={{
            bgcolor: DEEP,
            py: { xs: 7, md: 10 },
            borderTop: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                p: { xs: 3.5, md: 5 },
                borderRadius: 3,
                border: `1px solid rgba(0,237,100,0.16)`,
                bgcolor: "rgba(0,237,100,0.035)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, ${GREEN}, transparent 60%)`,
                  pointerEvents: "none",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
                <AdminIcon sx={{ color: GREEN, fontSize: 22 }} />
                <Typography
                  sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#F0F6F3" }}
                >
                  Admin Quick Links
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr 1fr",
                    md: "repeat(4, 1fr)",
                  },
                  gap: 1.5,
                }}
              >
                {adminLinks.map(({ label, href }) => (
                  <Button
                    key={label}
                    variant="outlined"
                    href={href}
                    fullWidth
                    sx={{
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.55)",
                      py: 1.25,
                      borderRadius: 1.5,
                      fontWeight: 500,
                      fontSize: "0.85rem",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: GREEN,
                        color: GREEN,
                        bgcolor: "rgba(0,237,100,0.06)",
                      },
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Box>
            </Box>
          </Container>
        </Box>
      )}

      {/* ─── FOOTER CTA (unauthenticated only) ───────────────────────── */}
      {!user && (
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            bgcolor: FOREST,
            py: { xs: 12, md: 18 },
            textAlign: "center",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              backgroundImage: `
                radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,237,100,0.28) 0%, transparent 70%),
                repeating-linear-gradient(
                  -48deg,
                  transparent,
                  transparent 72px,
                  rgba(0,0,0,0.04) 72px,
                  rgba(0,0,0,0.04) 73px
                )
              `,
              pointerEvents: "none",
            },
          }}
        >
          <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              component="h2"
              sx={{
                fontFamily: "'Source Serif Pro', Georgia, serif",
                fontWeight: 700,
                fontSize: { xs: "2.5rem", md: "4rem" },
                color: "white",
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                mb: 3,
              }}
            >
              Your next big idea starts{" "}
              <Box component="span" sx={{ color: GREEN }}>
                at a hackathon.
              </Box>
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "1.1rem",
                mb: 5.5,
                maxWidth: 460,
                mx: "auto",
                lineHeight: 1.65,
              }}
            >
              Join thousands of developers who have shipped real products at
              MongoDB hackathons.
            </Typography>
            <Button
              variant="contained"
              size="large"
              href="/register"
              endIcon={<ArrowIcon />}
              sx={{
                bgcolor: GREEN,
                color: NAVY,
                fontWeight: 700,
                fontSize: "1.05rem",
                px: 5,
                py: 1.75,
                borderRadius: 2,
                boxShadow: `0 0 44px rgba(0,237,100,0.42)`,
                transition: "all 0.25s ease",
                "&:hover": {
                  bgcolor: "#2FF87A",
                  transform: "translateY(-3px)",
                  boxShadow: `0 0 64px rgba(0,237,100,0.65)`,
                },
              }}
            >
              Join the Community
            </Button>
          </Container>
        </Box>
      )}
    </Box>
  );
}
