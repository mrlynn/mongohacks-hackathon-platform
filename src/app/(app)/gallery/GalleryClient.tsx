"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Chip,
  InputAdornment,
  Button,
} from "@mui/material";
import {
  Search as SearchIcon,
  GitHub as GitHubIcon,
  Launch as LaunchIcon,
  Folder as FolderIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import Link from "next/link";

const NAVY = "#001E2B";
const GREEN = "#00ED64";
const DEEP = "#000D14";

interface GalleryProject {
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

export default function GalleryClient({
  projects,
}: {
  projects: GalleryProject[];
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [projects]);

  const technologies = useMemo(() => {
    const techs = new Set(projects.flatMap((p) => p.technologies || []));
    return Array.from(techs).sort();
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        !selectedCategory || p.category === selectedCategory;
      const matchesTech =
        !selectedTech || p.technologies?.includes(selectedTech);
      return matchesSearch && matchesCategory && matchesTech;
    });
  }, [projects, search, selectedCategory, selectedTech]);

  return (
    <Box
      sx={{
        bgcolor: NAVY,
        minHeight: "100vh",
        color: "#E8EDEB",
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Button
            component={Link}
            href="/"
            startIcon={<ArrowBackIcon />}
            sx={{
              color: "rgba(255,255,255,0.45)",
              mb: 3,
              "&:hover": { color: GREEN },
            }}
          >
            Back to Home
          </Button>
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
            // Project gallery
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: "'Source Serif Pro', Georgia, serif",
              fontWeight: 700,
              fontSize: { xs: "2.25rem", md: "3.25rem" },
              letterSpacing: "-0.025em",
              color: "#F0F6F3",
              lineHeight: 1.1,
              mb: 2,
            }}
          >
            Featured{" "}
            <Box component="span" sx={{ color: GREEN }}>
              Projects
            </Box>
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.45)",
              fontSize: "1.05rem",
              lineHeight: 1.65,
              maxWidth: 560,
            }}
          >
            Explore the best projects built at MongoDB hackathon events.
          </Typography>
        </Box>

        {/* Search & Filters */}
        <Box sx={{ mb: 5 }}>
          <TextField
            fullWidth
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "rgba(255,255,255,0.3)" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                bgcolor: "rgba(255,255,255,0.04)",
                color: "#E8EDEB",
                borderRadius: 2,
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.08)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255,255,255,0.15)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: GREEN,
                },
              },
              "& .MuiInputBase-input::placeholder": {
                color: "rgba(255,255,255,0.3)",
                opacity: 1,
              },
            }}
          />

          {/* Category filters */}
          {categories.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.35)",
                  mb: 1,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Category
              </Typography>
              <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                <Chip
                  label="All"
                  size="small"
                  onClick={() => setSelectedCategory(null)}
                  sx={{
                    bgcolor: !selectedCategory
                      ? GREEN
                      : "rgba(255,255,255,0.06)",
                    color: !selectedCategory
                      ? NAVY
                      : "rgba(255,255,255,0.5)",
                    fontWeight: !selectedCategory ? 700 : 500,
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: !selectedCategory
                        ? GREEN
                        : "rgba(255,255,255,0.1)",
                    },
                  }}
                />
                {categories.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    size="small"
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === cat ? null : cat
                      )
                    }
                    sx={{
                      bgcolor:
                        selectedCategory === cat
                          ? GREEN
                          : "rgba(255,255,255,0.06)",
                      color:
                        selectedCategory === cat
                          ? NAVY
                          : "rgba(255,255,255,0.5)",
                      fontWeight: selectedCategory === cat ? 700 : 500,
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor:
                          selectedCategory === cat
                            ? GREEN
                            : "rgba(255,255,255,0.1)",
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Technology filters */}
          {technologies.length > 0 && (
            <Box>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.35)",
                  mb: 1,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Technology
              </Typography>
              <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                <Chip
                  label="All"
                  size="small"
                  onClick={() => setSelectedTech(null)}
                  sx={{
                    bgcolor: !selectedTech
                      ? GREEN
                      : "rgba(255,255,255,0.06)",
                    color: !selectedTech ? NAVY : "rgba(255,255,255,0.5)",
                    fontWeight: !selectedTech ? 700 : 500,
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: !selectedTech
                        ? GREEN
                        : "rgba(255,255,255,0.1)",
                    },
                  }}
                />
                {technologies.map((tech) => (
                  <Chip
                    key={tech}
                    label={tech}
                    size="small"
                    onClick={() =>
                      setSelectedTech(selectedTech === tech ? null : tech)
                    }
                    sx={{
                      bgcolor:
                        selectedTech === tech
                          ? GREEN
                          : "rgba(255,255,255,0.06)",
                      color:
                        selectedTech === tech
                          ? NAVY
                          : "rgba(255,255,255,0.5)",
                      fontWeight: selectedTech === tech ? 700 : 500,
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor:
                          selectedTech === tech
                            ? GREEN
                            : "rgba(255,255,255,0.1)",
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Results count */}
        <Typography
          sx={{
            fontSize: "0.85rem",
            color: "rgba(255,255,255,0.35)",
            mb: 3,
          }}
        >
          {filtered.length} project{filtered.length !== 1 ? "s" : ""}
        </Typography>

        {/* Project Grid */}
        {filtered.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 12,
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 3,
              bgcolor: "rgba(255,255,255,0.02)",
            }}
          >
            <FolderIcon
              sx={{
                fontSize: 48,
                color: "rgba(255,255,255,0.12)",
                mb: 2,
              }}
            />
            <Typography
              sx={{ color: "rgba(255,255,255,0.4)", fontSize: "1rem" }}
            >
              No projects match your filters.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 2.5,
            }}
          >
            {filtered.map((project) => {
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
                  sx={{
                    borderRadius: 3,
                    border: "1px solid rgba(255,255,255,0.06)",
                    bgcolor: "rgba(255,255,255,0.025)",
                    overflow: "hidden",
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
                      height: 180,
                      bgcolor: "rgba(255,255,255,0.04)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
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
                            fontSize: 48,
                            color: "rgba(255,255,255,0.1)",
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
                  <Box
                    sx={{
                      p: 3,
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.05rem",
                        color: "#F0F6F3",
                        mb: 0.5,
                        lineHeight: 1.3,
                      }}
                    >
                      {project.name}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        mb: 1.5,
                        flexWrap: "wrap",
                      }}
                    >
                      {teamName && (
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            color: "rgba(255,255,255,0.35)",
                          }}
                        >
                          by {teamName}
                        </Typography>
                      )}
                      {eventName && (
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            color: GREEN,
                            opacity: 0.6,
                          }}
                        >
                          {eventName}
                        </Typography>
                      )}
                    </Box>

                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        color: "rgba(255,255,255,0.4)",
                        lineHeight: 1.6,
                        mb: 2,
                        flex: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {project.description}
                    </Typography>

                    {/* Tech chips */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        flexWrap: "wrap",
                        mb: 2.5,
                      }}
                    >
                      {project.technologies?.slice(0, 4).map((tech) => (
                        <Chip
                          key={tech}
                          label={tech}
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: "0.7rem",
                            bgcolor: "rgba(255,255,255,0.06)",
                            color: "rgba(255,255,255,0.5)",
                            border: "none",
                          }}
                        />
                      ))}
                      {(project.technologies?.length || 0) > 4 && (
                        <Chip
                          label={`+${project.technologies.length - 4}`}
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: "0.7rem",
                            bgcolor: "rgba(255,255,255,0.04)",
                            color: "rgba(255,255,255,0.3)",
                            border: "none",
                          }}
                        />
                      )}
                    </Box>

                    {/* Links */}
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<GitHubIcon sx={{ fontSize: 16 }} />}
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: "0.75rem",
                          px: 1.5,
                          borderRadius: 1.5,
                          border: "1px solid rgba(255,255,255,0.08)",
                          "&:hover": {
                            borderColor: "rgba(255,255,255,0.2)",
                            bgcolor: "rgba(255,255,255,0.04)",
                            color: "#F0F6F3",
                          },
                        }}
                      >
                        Code
                      </Button>
                      {project.demoUrl && (
                        <Button
                          size="small"
                          startIcon={<LaunchIcon sx={{ fontSize: 16 }} />}
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: GREEN,
                            fontSize: "0.75rem",
                            px: 1.5,
                            borderRadius: 1.5,
                            border: `1px solid rgba(0,237,100,0.2)`,
                            "&:hover": {
                              borderColor: GREEN,
                              bgcolor: "rgba(0,237,100,0.06)",
                            },
                          }}
                        >
                          Demo
                        </Button>
                      )}
                    </Box>
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
