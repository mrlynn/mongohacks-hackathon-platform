"use client";

import { useMemo } from "react";
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
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Button,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Web as WebIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  OpenInNew as OpenInNewIcon,
  Business as BusinessIcon,
  CardGiftcard as PrizesIcon,
  Gavel as GavelIcon,
  AddOutlined,
} from "@mui/icons-material";
import Link from "next/link";
import { format } from "date-fns";
import ViewToggle from "@/components/shared-ui/ViewToggle";
import ExportButton from "@/components/shared-ui/ExportButton";
import {
  FilterToolbar,
  StatusFilter,
  DateRangeFilter,
  MultiSelectFilter,
  RangeFilter,
  useFilterState,
} from "@/components/shared-ui/filters";

interface Event {
  _id: string;
  name: string;
  theme: string;
  startDate: string;
  endDate: string;
  status: string;
  capacity: number;
  isVirtual: boolean;
  location?: string;
  city?: string;
  country?: string;
  landingPage?: {
    slug?: string;
    published?: boolean;
  };
  partners?: Array<{ _id: string; name: string; tier: string; logo?: string }>;
}

const statusColors: Record<string, "default" | "success" | "info" | "warning" | "error"> = {
  draft: "default",
  open: "success",
  in_progress: "info",
  concluded: "default",
};

const DEFAULT_FILTERS = {
  search: "",
  status: "",
  isVirtual: [] as string[],
  partnerTier: [] as string[],
  hasLandingPage: "",
  capacityMin: 0,
  capacityMax: 1000,
  startDateFrom: "",
  startDateTo: "",
  sortField: "startDate",
  sortDirection: "desc" as "asc" | "desc",
};

export default function EventsView({ events }: { events: Event[] }) {
  const {
    filters,
    updateFilter,
    clearFilters,
    activeCount,
    activeFilters,
  } = useFilterState(DEFAULT_FILTERS);

  // Apply filters and search
  const filteredAndSortedEvents = useMemo(() => {
    let result = [...events];

    // Search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(searchLower) ||
          e.theme.toLowerCase().includes(searchLower) ||
          e.city?.toLowerCase().includes(searchLower) ||
          e.country?.toLowerCase().includes(searchLower)
      );
    }

    // Status
    if (filters.status) {
      result = result.filter((e) => e.status === filters.status);
    }

    // Virtual/In-Person
    if (filters.isVirtual.length > 0) {
      result = result.filter((e) => {
        if (filters.isVirtual.includes("virtual")) {
          return e.isVirtual;
        }
        if (filters.isVirtual.includes("in-person")) {
          return !e.isVirtual;
        }
        return true;
      });
    }

    // Partner tier
    if (filters.partnerTier.length > 0) {
      result = result.filter((e) =>
        e.partners?.some((p) => filters.partnerTier.includes(p.tier.toLowerCase()))
      );
    }

    // Has landing page
    if (filters.hasLandingPage === "yes") {
      result = result.filter((e) => e.landingPage?.published);
    } else if (filters.hasLandingPage === "no") {
      result = result.filter((e) => !e.landingPage?.published);
    }

    // Capacity range
    result = result.filter(
      (e) => e.capacity >= filters.capacityMin && e.capacity <= filters.capacityMax
    );

    // Date range
    if (filters.startDateFrom) {
      result = result.filter((e) => new Date(e.startDate) >= new Date(filters.startDateFrom));
    }
    if (filters.startDateTo) {
      result = result.filter((e) => new Date(e.startDate) <= new Date(filters.startDateTo));
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
        case "startDate":
          aVal = new Date(a.startDate);
          bVal = new Date(b.startDate);
          break;
        case "capacity":
          aVal = a.capacity;
          bVal = b.capacity;
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return filters.sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return filters.sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [events, filters]);

  // Extract unique values for filters
  const uniqueCities = useMemo(
    () => Array.from(new Set(events.map((e) => e.city).filter(Boolean))),
    [events]
  );

  const uniqueCountries = useMemo(
    () => Array.from(new Set(events.map((e) => e.country).filter(Boolean))),
    [events]
  );

  const partnerTiers = useMemo(() => {
    const tiers = new Set<string>();
    events.forEach((e) => {
      e.partners?.forEach((p) => { if (p.tier) tiers.add(p.tier.toLowerCase()); });
    });
    return Array.from(tiers);
  }, [events]);

  // View state
  const [view, setView] = React.useState<"table" | "card">("table");

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error deleting event");
    }
  };

  // CSV export columns
  const csvColumns = [
    { key: "name" as const, label: "Event Name" },
    { key: "theme" as const, label: "Theme" },
    { key: "startDate" as const, label: "Start Date" },
    { key: "endDate" as const, label: "End Date" },
    { key: "status" as const, label: "Status" },
    { key: "capacity" as const, label: "Capacity" },
    { key: "isVirtual" as const, label: "Virtual" },
    { key: "location" as const, label: "Location" },
    { key: "city" as const, label: "City" },
    { key: "country" as const, label: "Country" },
  ];

  return (
    <Box>
      {/* Filter Toolbar */}
      <FilterToolbar
        searchValue={filters.search}
        onSearchChange={(value) => updateFilter("search", value)}
        searchPlaceholder="Search events by name, theme, location..."
        sortField={filters.sortField}
        sortDirection={filters.sortDirection}
        onSortFieldChange={(field) => updateFilter("sortField", field)}
        onSortDirectionChange={(dir) => updateFilter("sortDirection", dir)}
        sortOptions={[
          { value: "name", label: "Name" },
          { value: "startDate", label: "Start Date" },
          { value: "capacity", label: "Capacity" },
          { value: "status", label: "Status" },
        ]}
        activeFilters={activeFilters}
        onRemoveFilter={(key) => updateFilter(key as any, DEFAULT_FILTERS[key as keyof typeof DEFAULT_FILTERS])}
        onClearAllFilters={clearFilters}
        rightActions={
          <>
            <ViewToggle view={view} onChange={setView} />
            <ExportButton
              data={filteredAndSortedEvents}
              filename="events"
              columns={csvColumns}
            />
            <Button
              component={Link}
              href="/admin/events/new"
              variant="contained"
              startIcon={<AddOutlined />}
              sx={{ ml: "auto" }}
            >
              New Event
            </Button>
          </>
        }
      >
        {/* Filter Groups */}
        <StatusFilter
          label="Status"
          value={filters.status}
          onChange={(value) => updateFilter("status", value)}
          options={[
            { value: "draft", label: "Draft", color: "default" },
            { value: "open", label: "Open", color: "success" },
            { value: "in_progress", label: "In Progress", color: "info" },
            { value: "concluded", label: "Concluded", color: "default" },
          ]}
        />

        <MultiSelectFilter
          label="Event Type"
          options={[
            { value: "virtual", label: "Virtual" },
            { value: "in-person", label: "In-Person" },
          ]}
          selected={filters.isVirtual}
          onChange={(value) => updateFilter("isVirtual", value)}
        />

        {partnerTiers.length > 0 && (
          <MultiSelectFilter
            label="Partner Tier"
            options={partnerTiers.map((tier) => ({
              value: tier,
              label: tier.charAt(0).toUpperCase() + tier.slice(1),
            }))}
            selected={filters.partnerTier}
            onChange={(value) => updateFilter("partnerTier", value)}
          />
        )}

        <StatusFilter
          label="Landing Page"
          value={filters.hasLandingPage}
          onChange={(value) => updateFilter("hasLandingPage", value)}
          options={[
            { value: "yes", label: "Published" },
            { value: "no", label: "Not Published" },
          ]}
        />

        <RangeFilter
          label="Capacity"
          min={0}
          max={1000}
          value={[filters.capacityMin, filters.capacityMax]}
          onChange={([min, max]) => {
            updateFilter("capacityMin", min);
            updateFilter("capacityMax", max);
          }}
          step={50}
          unit="people"
        />

        <DateRangeFilter
          label="Start Date"
          startDate={filters.startDateFrom}
          endDate={filters.startDateTo}
          onStartDateChange={(date) => updateFilter("startDateFrom", date)}
          onEndDateChange={(date) => updateFilter("startDateTo", date)}
        />
      </FilterToolbar>

      {/* Results count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredAndSortedEvents.length} of {events.length} events
      </Typography>

      {/* Empty state */}
      {filteredAndSortedEvents.length === 0 && (
        <Paper elevation={2} sx={{ p: 4, textAlign: "center" }}>
          <Box sx={{ color: "text.secondary" }}>
            {filters.search || activeCount > 0
              ? "No events match your filters. Try adjusting your search criteria."
              : "No events found. Create your first event to get started."}
          </Box>
        </Paper>
      )}

      {/* Table View */}
      {view === "table" && filteredAndSortedEvents.length > 0 && (
        <TableContainer component={Paper} elevation={2} sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Event Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Theme</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Capacity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Partners</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Landing Page</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedEvents.map((event) => (
                <TableRow key={event._id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{event.name}</TableCell>
                  <TableCell>{event.theme}</TableCell>
                  <TableCell>
                    {format(new Date(event.startDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={event.status}
                      size="small"
                      color={statusColors[event.status]}
                    />
                  </TableCell>
                  <TableCell>{event.capacity}</TableCell>
                  <TableCell>
                    <Chip
                      label={event.isVirtual ? "Virtual" : "In-Person"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {event.partners && event.partners.length > 0 ? (
                      <Chip
                        icon={<BusinessIcon />}
                        label={event.partners.length}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {event.landingPage?.published ? (
                      <Tooltip title={`View /${event.landingPage.slug}`}>
                        <IconButton
                          size="small"
                          component={Link}
                          href={`/${event.landingPage.slug}`}
                          target="_blank"
                        >
                          <WebIcon fontSize="small" color="success" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Chip label="No Page" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        component={Link}
                        href={`/events/${event._id}`}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        component={Link}
                        href={`/admin/events/${event._id}/edit`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(event._id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Card View */}
      {view === "card" && filteredAndSortedEvents.length > 0 && (
        <Grid container spacing={3}>
          {filteredAndSortedEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {event.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {event.theme}
                  </Typography>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                    <Chip
                      label={event.status}
                      size="small"
                      color={statusColors[event.status]}
                    />
                    <Chip
                      label={event.isVirtual ? "Virtual" : "In-Person"}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    📅 {format(new Date(event.startDate), "MMM dd, yyyy")}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    👥 Capacity: {event.capacity}
                  </Typography>
                  {event.partners && event.partners.length > 0 && (
                    <Typography variant="body2">
                      🤝 {event.partners.length} Partners
                    </Typography>
                  )}
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    component={Link}
                    href={`/events/${event._id}`}
                    startIcon={<ViewIcon />}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    component={Link}
                    href={`/admin/events/${event._id}/edit`}
                    startIcon={<EditIcon />}
                  >
                    Edit
                  </Button>
                  {event.landingPage?.published && (
                    <IconButton
                      size="small"
                      component={Link}
                      href={`/${event.landingPage.slug}`}
                      target="_blank"
                    >
                      <WebIcon />
                    </IconButton>
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
