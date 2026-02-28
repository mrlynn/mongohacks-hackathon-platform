"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Card,
  CardContent,
  Typography,
  Grid,
  Link as MuiLink,
  CardActions,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Code as CodeIcon,
  Launch as LaunchIcon,
  GitHub as GitHubIcon,
  Description as DocsIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from "@mui/icons-material";
import ViewToggle from "@/components/shared-ui/ViewToggle";
import ExportButton from "@/components/shared-ui/ExportButton";
import {
  FilterToolbar,
  StatusFilter,
  MultiSelectFilter,
  useFilterState,
} from "@/components/shared-ui/filters";

interface Project {
  _id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  technologies: string[];
  repoUrl: string;
  demoUrl?: string;
  documentationUrl?: string;
  featured?: boolean;
  createdAt: string;
  eventId?: string;
  teamId?: string;
}

const statusColors: Record<string, "default" | "success" | "info" | "warning" | "error"> = {
  draft: "default",
  submitted: "info",
  under_review: "warning",
  judged: "success",
};

const DEFAULT_FILTERS = {
  search: "",
  status: "",
  statuses: [] as string[],
  categories: [] as string[],
  technologies: [] as string[],
  hasDemo: "",
  sortField: "createdAt",
  sortDirection: "desc" as "asc" | "desc",
};


export default function ProjectsView({ projects }: { projects: Project[] }) {
  const [view, setView] = useState<"table" | "card">("table");
  const [featuredMap, setFeaturedMap] = useState<Record<string, boolean>>(
    () => {
      const map: Record<string, boolean> = {};
      projects.forEach((p) => {
        map[p._id] = !!p.featured;
      });
      return map;
    }
  );

  const {
    filters,
    updateFilter,
    clearFilters,
    activeFilters,
  } = useFilterState(DEFAULT_FILTERS);

  // Extract unique values for filters
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    projects.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [projects]);

  const uniqueTechnologies = useMemo(() => {
    const techs = new Set<string>();
    projects.forEach((p) => {
      p.technologies?.forEach((tech) => {
        if (tech) techs.add(tech);
      });
    });
    return Array.from(techs).sort();
  }, [projects]);

  // Apply filters and search
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    // Search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.category?.toLowerCase().includes(searchLower) ||
          p.technologies?.some((tech) => tech.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (filters.statuses.length > 0) {
      result = result.filter((p) => filters.statuses.includes(p.status));
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter((p) => p.category && filters.categories.includes(p.category));
    }

    // Technology filter
    if (filters.technologies.length > 0) {
      result = result.filter((p) =>
        p.technologies?.some((tech) => filters.technologies.includes(tech))
      );
    }

    // Has demo filter
    if (filters.hasDemo === "yes") {
      result = result.filter((p) => p.demoUrl);
    } else if (filters.hasDemo === "no") {
      result = result.filter((p) => !p.demoUrl);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (filters.sortField) {
        case "name":
          aVal = a.name;
          bVal = b.name;
          break;
        case "category":
          aVal = a.category || "";
          bVal = b.category || "";
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        case "createdAt":
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return filters.sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return filters.sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [projects, filters]);

  const toggleFeatured = async (projectId: string) => {
    const newVal = !featuredMap[projectId];
    setFeaturedMap((prev) => ({ ...prev, [projectId]: newVal }));
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/featured`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: newVal }),
      });
      if (!res.ok) {
        setFeaturedMap((prev) => ({ ...prev, [projectId]: !newVal }));
      }
    } catch {
      setFeaturedMap((prev) => ({ ...prev, [projectId]: !newVal }));
    }
  };

  // CSV export columns
  const csvColumns = [
    { key: "name" as const, label: "Project Name" },
    { key: "category" as const, label: "Category" },
    { key: "status" as const, label: "Status" },
    { key: "technologies" as const, label: "Technologies" },
    { key: "repoUrl" as const, label: "GitHub URL" },
    { key: "demoUrl" as const, label: "Demo URL" },
    { key: "documentationUrl" as const, label: "Docs URL" },
    { key: "createdAt" as const, label: "Submitted" },
  ];

  // Transform data for CSV
  const csvData = filteredAndSortedProjects.map((project) => ({
    ...project,
    technologies: project.technologies?.join("; ") || "",
    createdAt: new Date(project.createdAt).toLocaleDateString(),
  }));

  if (projects.length === 0 && !filters.search && activeFilters.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          No projects submitted yet. Projects will appear here once teams submit their work.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Filter Toolbar */}
      <FilterToolbar
        searchValue={filters.search}
        onSearchChange={(value) => updateFilter("search", value)}
        searchPlaceholder="Search projects by name, description, tech..."
        sortField={filters.sortField}
        sortDirection={filters.sortDirection}
        onSortFieldChange={(field) => updateFilter("sortField", field)}
        onSortDirectionChange={(dir) => updateFilter("sortDirection", dir)}
        sortOptions={[
          { value: "name", label: "Name" },
          { value: "category", label: "Category" },
          { value: "status", label: "Status" },
          { value: "createdAt", label: "Submitted" },
        ]}
        activeFilters={activeFilters}
        onRemoveFilter={(key) => updateFilter(key as any, DEFAULT_FILTERS[key as keyof typeof DEFAULT_FILTERS])}
        onClearAllFilters={clearFilters}
        rightActions={
          <>
            <ViewToggle view={view} onChange={setView} />
            <ExportButton data={csvData} filename="projects" columns={csvColumns} />
          </>
        }
      >
        {/* Filter Groups */}
        <MultiSelectFilter
          label="Status"
          options={[
            { value: "draft", label: "Draft" },
            { value: "submitted", label: "Submitted" },
            { value: "under_review", label: "Under Review" },
            { value: "judged", label: "Judged" },
          ]}
          selected={filters.statuses}
          onChange={(value) => updateFilter("statuses", value)}
        />

        {uniqueCategories.length > 0 && (
          <MultiSelectFilter
            label="Category"
            options={uniqueCategories.map((cat) => ({ value: cat, label: cat }))}
            selected={filters.categories}
            onChange={(value) => updateFilter("categories", value)}
          />
        )}

        {uniqueTechnologies.length > 0 && (
          <MultiSelectFilter
            label="Technologies"
            options={uniqueTechnologies.map((tech) => ({ value: tech, label: tech }))}
            selected={filters.technologies}
            onChange={(value) => updateFilter("technologies", value)}
          />
        )}

        <StatusFilter
          label="Demo URL"
          value={filters.hasDemo}
          onChange={(value) => updateFilter("hasDemo", value)}
          options={[
            { value: "yes", label: "Has Demo" },
            { value: "no", label: "No Demo" },
          ]}
        />
      </FilterToolbar>

      {/* Results count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredAndSortedProjects.length} of {projects.length} projects
      </Typography>

      {/* Empty state */}
      {filteredAndSortedProjects.length === 0 && (filters.search || activeFilters.length > 0) && (
        <Paper elevation={2} sx={{ p: 4, textAlign: "center" }}>
          <Box sx={{ color: "text.secondary" }}>
            No projects match your filters. Try adjusting your search criteria.
          </Box>
        </Paper>
      )}

      {/* Table View */}
      {view === "table" && (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Featured</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Project Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Technologies</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Links</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Submitted</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedProjects.map((project) => (
                <TableRow key={project._id} hover>
                  <TableCell>
                    <Tooltip title={featuredMap[project._id] ? "Remove from gallery" : "Feature in gallery"}>
                      <IconButton
                        size="small"
                        onClick={() => toggleFeatured(project._id)}
                        sx={{
                          color: featuredMap[project._id] ? "#FFC010" : "text.disabled",
                        }}
                      >
                        {featuredMap[project._id] ? <StarIcon /> : <StarBorderIcon />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{project.name}</TableCell>
                  <TableCell>{project.category || "Uncategorized"}</TableCell>
                  <TableCell>
                    <Chip
                      label={project.status.replace("_", " ")}
                      size="small"
                      color={statusColors[project.status] || "default"}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {project.technologies?.slice(0, 3).map((tech) => (
                        <Chip key={tech} label={tech} size="small" variant="outlined" />
                      ))}
                      {(project.technologies?.length || 0) > 3 && (
                        <Chip
                          label={`+${(project.technologies?.length || 0) - 3}`}
                          size="small"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <MuiLink href={project.repoUrl} target="_blank" rel="noopener">
                        <GitHubIcon fontSize="small" />
                      </MuiLink>
                      {project.demoUrl && (
                        <MuiLink href={project.demoUrl} target="_blank" rel="noopener">
                          <LaunchIcon fontSize="small" />
                        </MuiLink>
                      )}
                      {project.documentationUrl && (
                        <MuiLink href={project.documentationUrl} target="_blank" rel="noopener">
                          <DocsIcon fontSize="small" />
                        </MuiLink>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{new Date(project.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Card View */}
      {view === "card" && (
        <Grid container spacing={3}>
          {filteredAndSortedProjects.map((project) => (
            <Grid key={project._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <CodeIcon sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {project.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {project.category || "Uncategorized"}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description?.substring(0, 120)}
                    {(project.description?.length || 0) > 120 && "..."}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                      Tech Stack:
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {project.technologies?.map((tech) => (
                        <Chip key={tech} label={tech} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>

                  <Chip
                    label={project.status.replace("_", " ")}
                    size="small"
                    color={statusColors[project.status] || "default"}
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="caption" color="text.secondary" display="block">
                    Submitted: {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Tooltip title={featuredMap[project._id] ? "Remove from gallery" : "Feature in gallery"}>
                    <IconButton
                      size="small"
                      onClick={() => toggleFeatured(project._id)}
                      sx={{
                        color: featuredMap[project._id] ? "#FFC010" : "text.disabled",
                      }}
                    >
                      {featuredMap[project._id] ? <StarIcon /> : <StarBorderIcon />}
                    </IconButton>
                  </Tooltip>
                  <Button
                    size="small"
                    startIcon={<GitHubIcon />}
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener"
                  >
                    GitHub
                  </Button>
                  {project.demoUrl && (
                    <Button
                      size="small"
                      startIcon={<LaunchIcon />}
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener"
                    >
                      Demo
                    </Button>
                  )}
                  {project.documentationUrl && (
                    <Button
                      size="small"
                      startIcon={<DocsIcon />}
                      href={project.documentationUrl}
                      target="_blank"
                      rel="noopener"
                    >
                      Docs
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
