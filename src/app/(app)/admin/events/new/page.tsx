"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Grid,
  MenuItem,
  Alert,
  InputAdornment,
  Paper,
  Typography,
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  EventOutlined,
  InfoOutlined,
  TitleOutlined,
  PaletteOutlined,
  LocalOfferOutlined,
  CalendarMonthOutlined,
  LocationOnOutlined,
  PublicOutlined,
  BusinessOutlined,
  ExploreOutlined,
  TuneOutlined,
  PeopleOutlined,
  CheckCircleOutline as CheckCircleIcon,
  Web as WebIcon,
  List as ListIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { mongoColors } from "@/styles/theme";
import {
  PageHeader,
  FormCard,
  FormSectionHeader,
  FormActions,
} from "@/components/shared-ui/FormElements";

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    theme: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    location: "",
    city: "",
    country: "",
    venue: "",
    latitude: "",
    longitude: "",
    capacity: 100,
    isVirtual: false,
    tags: "",
    rules: "",
    judging_criteria: "",
    status: "draft" as "draft" | "open",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        judging_criteria: formData.judging_criteria
          .split("\n")
          .map((c) => c.trim())
          .filter(Boolean),
        coordinates:
          formData.latitude && formData.longitude
            ? {
                type: "Point",
                coordinates: [
                  parseFloat(formData.longitude),
                  parseFloat(formData.latitude),
                ],
              }
            : undefined,
      };

      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setCreatedEventId(data.event?._id || data.eventId || data.id);
      } else {
        setError(data.error || "Failed to create event");
      }
    } catch (err) {
      setError("An error occurred while creating the event");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (createdEventId) {
    return (
      <Box>
        <PageHeader
          icon={<CheckCircleIcon />}
          title="Event Created!"
          subtitle="Your new hackathon event has been created successfully"
        />
        <Paper
          elevation={3}
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 3,
            maxWidth: 600,
            mx: "auto",
            mt: 4,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {formData.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Ready to build a landing page for your event? Create a stunning
            public page to attract participants.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<WebIcon />}
              onClick={() =>
                router.push(`/admin/events/${createdEventId}/landing-page`)
              }
            >
              Build Landing Page
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<ListIcon />}
              onClick={() => router.push("/admin/events")}
            >
              Go to Events
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        icon={<EventOutlined />}
        title="Create New Event"
        subtitle="Set up a new hackathon event with location and details"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <FormCard>
          <FormSectionHeader
            icon={<InfoOutlined />}
            title="Basic Information"
            subtitle="Name, description, and theme"
          />
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Event Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <TitleOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Theme"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                required
                placeholder="e.g., AI/ML, Web3, Climate Tech"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PaletteOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Tags (comma-separated)"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="hackathon, mongodb, ai"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalOfferOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
          </Grid>
        </FormCard>

        <FormCard
          accentColor={mongoColors.blue.main}
          accentColorEnd={mongoColors.blue.dark}
        >
          <FormSectionHeader
            icon={<CalendarMonthOutlined />}
            title="Dates & Time"
            subtitle="Event schedule and registration deadline"
          />
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Registration Deadline"
                name="registrationDeadline"
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </FormCard>

        <FormCard
          accentColor={mongoColors.purple.main}
          accentColorEnd={mongoColors.purple.dark}
        >
          <FormSectionHeader
            icon={<LocationOnOutlined />}
            title="Location & Venue"
            subtitle="Where the hackathon takes place"
          />
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isVirtual}
                    onChange={handleChange}
                    name="isVirtual"
                    color="primary"
                  />
                }
                label="Virtual Event"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Location Address"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="123 Main St, San Francisco, CA"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="San Francisco"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PublicOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="United States"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PublicOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Venue Name"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="MongoDB HQ"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Latitude"
                name="latitude"
                type="number"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="37.7749"
                inputProps={{ step: "any" }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <ExploreOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Longitude"
                name="longitude"
                type="number"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="-122.4194"
                inputProps={{ step: "any" }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <ExploreOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
          </Grid>
        </FormCard>

        <FormCard
          accentColor={mongoColors.slate.light}
          accentColorEnd={mongoColors.gray[600]}
        >
          <FormSectionHeader
            icon={<TuneOutlined />}
            title="Event Configuration"
            subtitle="Capacity, rules, and judging criteria"
          />
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PeopleOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="open">Open for Registration</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Rules & Guidelines"
                name="rules"
                value={formData.rules}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Judging Criteria (one per line)"
                name="judging_criteria"
                value={formData.judging_criteria}
                onChange={handleChange}
                placeholder="Innovation&#10;Technical Complexity&#10;Design&#10;Impact"
              />
            </Grid>
          </Grid>
        </FormCard>

        <FormActions>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() => router.push("/admin/events")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Event"}
          </Button>
        </FormActions>
      </form>
    </Box>
  );
}
