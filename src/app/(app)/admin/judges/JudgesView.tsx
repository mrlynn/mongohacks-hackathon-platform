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
  Button,
  CardActions,
  Alert,
  Divider,
} from "@mui/material";
import {
  Gavel as GavelIcon,
  Email as EmailIcon,
  Event as EventIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import ViewToggle from "@/components/shared-ui/ViewToggle";
import ExportButton from "@/components/shared-ui/ExportButton";
import {
  FilterToolbar,
  RangeFilter,
  DateRangeFilter,
  useFilterState,
} from "@/components/shared-ui/filters";

interface Judge {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface EventItem {
  _id: string;
  name: string;
  status: string;
}

interface JudgesViewProps {
  judges: Judge[];
  events: EventItem[];
  assignmentCountMap: Record<string, number>;
}


const DEFAULT_FILTERS = {
  search: "",
  assignmentsMin: 0,
  assignmentsMax: 50,
  joinedFrom: "",
  joinedTo: "",
  sortField: "name",
  sortDirection: "asc" as "asc" | "desc",
};

export default function JudgesView({
  judges,
  events,
  assignmentCountMap,
}: JudgesViewProps) {
  const [view, setView] = useState<"table" | "card">("table");

  const {
    filters,
    updateFilter,
    clearFilters,
    activeFilters,
  } = useFilterState(DEFAULT_FILTERS);

  // Apply filters and search
  const filteredAndSortedJudges = useMemo(() => {
    let result = [...judges];

    // Search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (j) =>
          j.name.toLowerCase().includes(searchLower) ||
          j.email.toLowerCase().includes(searchLower)
      );
    }

    // Assignment count range
    result = result.filter((j) => {
      const count = assignmentCountMap[j._id] || 0;
      return count >= filters.assignmentsMin && count <= filters.assignmentsMax;
    });

    // Join date range
    if (filters.joinedFrom) {
      result = result.filter((j) => new Date(j.createdAt) >= new Date(filters.joinedFrom));
    }
    if (filters.joinedTo) {
      result = result.filter((j) => new Date(j.createdAt) <= new Date(filters.joinedTo));
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
        case "email":
          aVal = a.email;
          bVal = b.email;
          break;
        case "assignments":
          aVal = assignmentCountMap[a._id] || 0;
          bVal = assignmentCountMap[b._id] || 0;
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
  }, [judges, filters, assignmentCountMap]);

  // CSV export columns
  const csvColumns = [
    { key: "name" as const, label: "Name" },
    { key: "email" as const, label: "Email" },
    { key: "createdAt" as const, label: "Joined" },
  ];

  // Transform data for CSV
  const csvData = filteredAndSortedJudges.map((judge) => ({
    ...judge,
    createdAt: new Date(judge.createdAt).toLocaleDateString(),
  }));

  if (judges.length === 0 && !filters.search && activeFilters.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          No judges assigned yet. Promote users to the judge role from the Users
          Management page.
        </Typography>
        <Button variant="contained" href="/admin/users">
          Go to User Management
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Quick Actions: Direct links to assign judges for each event */}
      {events.length > 0 && (
        <Card sx={{ mb: 3 }} variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              <GavelIcon
                sx={{ fontSize: 20, verticalAlign: "middle", mr: 1 }}
              />
              Assign Judges to Projects
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select an event below to assign judges to its submitted projects.
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {events.map((event) => (
                <Button
                  key={event._id}
                  variant="outlined"
                  size="small"
                  href={`/admin/events/${event._id}/judging`}
                  startIcon={<EventIcon />}
                  endIcon={<ArrowForwardIcon />}
                >
                  {event.name}
                </Button>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {events.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            No active events found. Create an event first, then you can assign
            judges to its projects from the event&apos;s judging page.
          </Typography>
        </Alert>
      )}

      {/* Filter Toolbar */}
      <FilterToolbar
        searchValue={filters.search}
        onSearchChange={(value) => updateFilter("search", value)}
        searchPlaceholder="Search judges by name or email..."
        sortField={filters.sortField}
        sortDirection={filters.sortDirection}
        onSortFieldChange={(field) => updateFilter("sortField", field)}
        onSortDirectionChange={(dir) => updateFilter("sortDirection", dir)}
        sortOptions={[
          { value: "name", label: "Name" },
          { value: "email", label: "Email" },
          { value: "assignments", label: "Assignments" },
          { value: "createdAt", label: "Joined" },
        ]}
        activeFilters={activeFilters}
        onRemoveFilter={(key) => updateFilter(key as any, DEFAULT_FILTERS[key as keyof typeof DEFAULT_FILTERS])}
        onClearAllFilters={clearFilters}
        rightActions={
          <>
            <ViewToggle view={view} onChange={setView} />
            <ExportButton data={csvData} filename="judges" columns={csvColumns} />
          </>
        }
      >
        {/* Filter Groups */}
        <RangeFilter
          label="Assigned Projects"
          min={0}
          max={50}
          value={[filters.assignmentsMin, filters.assignmentsMax]}
          onChange={([min, max]) => {
            updateFilter("assignmentsMin", min);
            updateFilter("assignmentsMax", max);
          }}
          step={1}
          unit="projects"
        />

        <DateRangeFilter
          label="Join Date"
          startDate={filters.joinedFrom}
          endDate={filters.joinedTo}
          onStartDateChange={(date) => updateFilter("joinedFrom", date)}
          onEndDateChange={(date) => updateFilter("joinedTo", date)}
        />
      </FilterToolbar>

      {/* Results count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredAndSortedJudges.length} of {judges.length} judges
      </Typography>

      {/* Empty state */}
      {filteredAndSortedJudges.length === 0 && (filters.search || activeFilters.length > 0) && (
        <Paper elevation={2} sx={{ p: 4, textAlign: "center" }}>
          <Box sx={{ color: "text.secondary" }}>
            No judges match your filters. Try adjusting your search criteria.
          </Box>
        </Paper>
      )}

      {/* Table View */}
      {view === "table" && (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  Assigned Projects
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedJudges.map((judge) => (
                <TableRow key={judge._id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{judge.name}</TableCell>
                  <TableCell>{judge.email}</TableCell>
                  <TableCell>
                    {new Date(judge.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${assignmentCountMap[judge._id] || 0} projects`}
                      size="small"
                      color={
                        assignmentCountMap[judge._id] ? "primary" : "default"
                      }
                      variant={
                        assignmentCountMap[judge._id] ? "filled" : "outlined"
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Card View */}
      {view === "card" && (
        <Grid container spacing={3}>
          {filteredAndSortedJudges.map((judge) => (
            <Grid key={judge._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <GavelIcon
                      sx={{ fontSize: 40, color: "info.main", mr: 2 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {judge.name}
                      </Typography>
                      <Chip
                        label="Judge"
                        size="small"
                        color="info"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>

                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                  >
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {judge.email}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={`${assignmentCountMap[judge._id] || 0} projects assigned`}
                      size="small"
                      color={
                        assignmentCountMap[judge._id] ? "primary" : "default"
                      }
                      variant={
                        assignmentCountMap[judge._id] ? "filled" : "outlined"
                      }
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Joined: {new Date(judge.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
