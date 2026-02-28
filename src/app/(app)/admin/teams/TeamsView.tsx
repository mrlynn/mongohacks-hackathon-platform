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
  Avatar,
  AvatarGroup,
  Tooltip,
  IconButton,
  Button,
  Stack,
} from "@mui/material";
import {
  Group as GroupIcon,
  Person as PersonIcon,
  PersonSearch as PersonSearchIcon,
  Storage as StorageIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import Link from "next/link";
import ViewToggle from "@/components/shared-ui/ViewToggle";
import ExportButton from "@/components/shared-ui/ExportButton";
import {
  FilterToolbar,
  StatusFilter,
  MultiSelectFilter,
  RangeFilter,
  useFilterState,
} from "@/components/shared-ui/filters";

interface Team {
  _id: string;
  name: string;
  description: string;
  event: string;
  eventId: string;
  leader: string;
  leaderId: string;
  memberCount: number;
  members: Array<{ _id: string; name: string; email: string }>;
  lookingForMembers: boolean;
  requiredSkills: string[];
  createdAt: string;
}


const DEFAULT_FILTERS = {
  search: "",
  status: "",
  events: [] as string[],
  lookingForMembers: "",
  skills: [] as string[],
  teamSizeMin: 1,
  teamSizeMax: 10,
  sortField: "createdAt",
  sortDirection: "desc" as "asc" | "desc",
};

export default function TeamsView({ teams }: { teams: Team[] }) {
  const [view, setView] = useState<"table" | "card">("table");

  const {
    filters,
    updateFilter,
    clearFilters,
    activeFilters,
  } = useFilterState(DEFAULT_FILTERS);

  // Extract unique values for filters
  const uniqueEvents = useMemo(() => {
    const events = new Map<string, string>();
    teams.forEach((t) => {
      if (t.eventId && t.event) events.set(t.eventId, t.event);
    });
    return Array.from(events.entries()).map(([id, name]) => ({ value: id, label: name }));
  }, [teams]);

  const uniqueSkills = useMemo(() => {
    const skills = new Set<string>();
    teams.forEach((t) => {
      t.requiredSkills?.forEach((skill) => {
        if (skill) skills.add(skill);
      });
    });
    return Array.from(skills).sort();
  }, [teams]);

  // Apply filters and search
  const filteredAndSortedTeams = useMemo(() => {
    let result = [...teams];

    // Search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.leader.toLowerCase().includes(searchLower) ||
          t.requiredSkills?.some((skill) => skill.toLowerCase().includes(searchLower))
      );
    }

    // Event filter
    if (filters.events.length > 0) {
      result = result.filter((t) => filters.events.includes(t.eventId));
    }

    // Looking for members filter
    if (filters.lookingForMembers === "yes") {
      result = result.filter((t) => t.lookingForMembers);
    } else if (filters.lookingForMembers === "no") {
      result = result.filter((t) => !t.lookingForMembers);
    }

    // Skills filter
    if (filters.skills.length > 0) {
      result = result.filter((t) =>
        t.requiredSkills?.some((skill) => filters.skills.includes(skill))
      );
    }

    // Team size range
    result = result.filter(
      (t) => t.memberCount >= filters.teamSizeMin && t.memberCount <= filters.teamSizeMax
    );

    // Sort
    result.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (filters.sortField) {
        case "name":
          aVal = a.name;
          bVal = b.name;
          break;
        case "memberCount":
          aVal = a.memberCount;
          bVal = b.memberCount;
          break;
        case "createdAt":
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        case "event":
          aVal = a.event;
          bVal = b.event;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return filters.sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return filters.sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [teams, filters]);

  // CSV export columns
  const csvColumns = [
    { key: "name" as const, label: "Team Name" },
    { key: "event" as const, label: "Event" },
    { key: "leader" as const, label: "Team Leader" },
    { key: "memberCount" as const, label: "Members" },
    { key: "lookingForMembers" as const, label: "Looking for Members" },
    { key: "requiredSkills" as const, label: "Required Skills" },
    { key: "createdAt" as const, label: "Created" },
  ];

  // Transform data for CSV
  const csvData = filteredAndSortedTeams.map((team) => ({
    ...team,
    lookingForMembers: team.lookingForMembers ? "Yes" : "No",
    requiredSkills: team.requiredSkills.join("; "),
    createdAt: new Date(team.createdAt).toLocaleDateString(),
  }));

  if (teams.length === 0 && !filters.search && activeFilters.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          No teams created yet. Teams will appear here once participants start forming groups.
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
        searchPlaceholder="Search teams by name, leader, skills..."
        sortField={filters.sortField}
        sortDirection={filters.sortDirection}
        onSortFieldChange={(field) => updateFilter("sortField", field)}
        onSortDirectionChange={(dir) => updateFilter("sortDirection", dir)}
        sortOptions={[
          { value: "name", label: "Team Name" },
          { value: "memberCount", label: "Team Size" },
          { value: "event", label: "Event" },
          { value: "createdAt", label: "Created" },
        ]}
        activeFilters={activeFilters}
        onRemoveFilter={(key) => updateFilter(key as any, DEFAULT_FILTERS[key as keyof typeof DEFAULT_FILTERS])}
        onClearAllFilters={clearFilters}
        rightActions={
          <>
            <ViewToggle view={view} onChange={setView} />
            <ExportButton data={csvData} filename="teams" columns={csvColumns} />
          </>
        }
      >
        {/* Filter Groups */}
        {uniqueEvents.length > 0 && (
          <MultiSelectFilter
            label="Event"
            options={uniqueEvents}
            selected={filters.events}
            onChange={(value) => updateFilter("events", value)}
          />
        )}

        <StatusFilter
          label="Looking for Members"
          value={filters.lookingForMembers}
          onChange={(value) => updateFilter("lookingForMembers", value)}
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
        />

        {uniqueSkills.length > 0 && (
          <MultiSelectFilter
            label="Required Skills"
            options={uniqueSkills.map((skill) => ({ value: skill, label: skill }))}
            selected={filters.skills}
            onChange={(value) => updateFilter("skills", value)}
          />
        )}

        <RangeFilter
          label="Team Size"
          min={1}
          max={10}
          value={[filters.teamSizeMin, filters.teamSizeMax]}
          onChange={([min, max]) => {
            updateFilter("teamSizeMin", min);
            updateFilter("teamSizeMax", max);
          }}
          step={1}
          unit="members"
        />
      </FilterToolbar>

      {/* Results count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredAndSortedTeams.length} of {teams.length} teams
      </Typography>

      {/* Empty state */}
      {filteredAndSortedTeams.length === 0 && (filters.search || activeFilters.length > 0) && (
        <Paper elevation={2} sx={{ p: 4, textAlign: "center" }}>
          <Box sx={{ color: "text.secondary" }}>
            No teams match your filters. Try adjusting your search criteria.
          </Box>
        </Paper>
      )}

      {/* Table View */}
      {view === "table" && (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Team Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Event</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Leader</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Members</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Skills Needed</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedTeams.map((team) => (
                <TableRow key={team._id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{team.name}</TableCell>
                  <TableCell>{team.event}</TableCell>
                  <TableCell>{team.leader}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AvatarGroup max={4} sx={{ "& .MuiAvatar-root": { width: 28, height: 28, fontSize: 13 } }}>
                        {team.members.map((member) => (
                          <Tooltip key={member._id} title={`${member.name} (${member.email})`}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: 13 }}>
                              {member.name.charAt(0)}
                            </Avatar>
                          </Tooltip>
                        ))}
                      </AvatarGroup>
                      <Typography variant="caption" color="text.secondary">
                        {team.memberCount}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {team.requiredSkills.length > 0 ? (
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {team.requiredSkills.slice(0, 2).map((skill) => (
                          <Chip key={skill} label={skill} size="small" variant="outlined" />
                        ))}
                        {team.requiredSkills.length > 2 && (
                          <Chip label={`+${team.requiredSkills.length - 2}`} size="small" />
                        )}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        None
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {team.lookingForMembers ? (
                      <Chip
                        label="Looking for Members"
                        size="small"
                        color="warning"
                        icon={<PersonSearchIcon />}
                      />
                    ) : (
                      <Chip label="Full" size="small" color="success" />
                    )}
                  </TableCell>
                  <TableCell>{new Date(team.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="View team page">
                        <IconButton
                          size="small"
                          component={Link}
                          href={`/events/${team.eventId}/teams/${team._id}`}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Atlas Cluster">
                        <IconButton
                          size="small"
                          component={Link}
                          href={`/teams/${team._id}/atlas`}
                          color="primary"
                        >
                          <StorageIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
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
          {filteredAndSortedTeams.map((team) => (
            <Grid key={team._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <GroupIcon sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {team.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {team.event}
                      </Typography>
                    </Box>
                  </Box>

                  {team.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {team.description.substring(0, 100)}
                      {team.description.length > 100 && "..."}
                    </Typography>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                      Team Leader:
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2">{team.leader}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                      Members ({team.memberCount}):
                    </Typography>
                    <AvatarGroup max={4}>
                      {team.members.map((member) => (
                        <Tooltip key={member._id} title={member.name}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {member.name.charAt(0)}
                          </Avatar>
                        </Tooltip>
                      ))}
                    </AvatarGroup>
                  </Box>

                  {team.requiredSkills.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                        Skills Needed:
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {team.requiredSkills.map((skill) => (
                          <Chip key={skill} label={skill} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                    {team.lookingForMembers ? (
                      <Chip
                        label="Looking for Members"
                        size="small"
                        color="warning"
                        icon={<PersonSearchIcon />}
                      />
                    ) : (
                      <Chip label="Full" size="small" color="success" />
                    )}
                  </Box>

                  {/* Action Buttons */}
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      component={Link}
                      href={`/events/${team.eventId}/teams/${team._id}`}
                      fullWidth
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<StorageIcon />}
                      component={Link}
                      href={`/teams/${team._id}/atlas`}
                      color="primary"
                      fullWidth
                    >
                      Atlas
                    </Button>
                  </Stack>

                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(team.createdAt).toLocaleDateString()}
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
