"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
  Autocomplete,
  Chip,
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  EditOutlined,
  InfoOutlined,
  TitleOutlined,
  PaletteOutlined,
  CalendarMonthOutlined,
  LocationOnOutlined,
  PublicOutlined,
  BusinessOutlined,
  TuneOutlined,
  PeopleOutlined,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { mongoColors } from "@/styles/theme";
import {
  PageHeader,
  FormCard,
  FormSectionHeader,
  FormActions,
} from "@/components/shared-ui/FormElements";

export default function EditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const router = useRouter();
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [registrationForms, setRegistrationForms] = useState<
    { _id: string; name: string; slug: string }[]
  >([]);
  const [selectedFormConfig, setSelectedFormConfig] = useState("");

  const [allPartners, setAllPartners] = useState<
    { _id: string; name: string; tier: string }[]
  >([]);
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([]);

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
    capacity: 100,
    isVirtual: false,
    status: "draft" as "draft" | "open" | "in_progress" | "concluded",
  });

  useEffect(() => {
    params.then((p) => {
      setEventId(p.eventId);
      fetchEvent(p.eventId);
    });
    fetchRegistrationForms();
    fetchPartners();
  }, []);

  const fetchRegistrationForms = async () => {
    try {
      const res = await fetch("/api/admin/registration-forms");
      const data = await res.json();
      if (data.success) setRegistrationForms(data.forms);
    } catch {
      // Non-critical, selector will just be empty
    }
  };

  const fetchPartners = async () => {
    try {
      const res = await fetch("/api/partners?status=active&limit=200");
      const data = await res.json();
      if (res.ok) setAllPartners(data.partners || data);
    } catch {
      // Non-critical
    }
  };

  const fetchEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/events/${id}`);
      const data = await res.json();

      if (res.ok && data.event) {
        const event = data.event;
        setFormData({
          name: event.name || "",
          description: event.description || "",
          theme: event.theme || "",
          startDate: event.startDate ? event.startDate.slice(0, 16) : "",
          endDate: event.endDate ? event.endDate.slice(0, 16) : "",
          registrationDeadline: event.registrationDeadline
            ? event.registrationDeadline.slice(0, 16)
            : "",
          location: event.location || "",
          city: event.city || "",
          country: event.country || "",
          venue: event.venue || "",
          capacity: event.capacity || 100,
          isVirtual: event.isVirtual || false,
          status: event.status || "draft",
        });
        // Set selected partners (may be populated objects or plain IDs)
        if (event.partners && event.partners.length > 0) {
          setSelectedPartnerIds(
            event.partners.map((p: { _id?: string } | string) =>
              typeof p === "object" && p._id ? String(p._id) : String(p)
            )
          );
        }
        if (event.landingPage?.registrationFormConfig) {
          setSelectedFormConfig(
            String(event.landingPage.registrationFormConfig)
          );
        }
      } else {
        setError("Failed to load event");
      }
    } catch (err) {
      setError("Failed to load event");
    } finally {
      setLoading(false);
    }
  };

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
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          partners: selectedPartnerIds,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          registrationDeadline: new Date(
            formData.registrationDeadline
          ).toISOString(),
          ...(selectedFormConfig && {
            "landingPage.registrationFormConfig": selectedFormConfig,
          }),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Event updated successfully!");
        setTimeout(() => {
          router.push("/admin/events");
        }, 1500);
      } else {
        setError(data.message || "Failed to update event");
      }
    } catch (err) {
      setError("Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageHeader
        icon={<EditOutlined />}
        title="Edit Event"
        subtitle="Update hackathon event details"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <FormCard>
          <FormSectionHeader
            icon={<InfoOutlined />}
            title="Basic Information"
            subtitle="Name, theme, and description"
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
                        <TitleOutlined
                          sx={{ color: "text.secondary", fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Theme"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PaletteOutlined
                          sx={{ color: "text.secondary", fontSize: 20 }}
                        />
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
                label="Start Date & Time"
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="End Date & Time"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
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
                InputLabelProps={{ shrink: true }}
                required
                helperText="Registrations close after this date"
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
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                helperText="City, State/Country"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnOutlined
                          sx={{ color: "text.secondary", fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Venue"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                helperText="Specific venue name (optional)"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessOutlined
                          sx={{ color: "text.secondary", fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PublicOutlined
                          sx={{ color: "text.secondary", fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PublicOutlined
                          sx={{ color: "text.secondary", fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControlLabel
                control={
                  <Switch
                    name="isVirtual"
                    checked={formData.isVirtual}
                    onChange={handleChange}
                  />
                }
                label="Virtual Event"
                sx={{ mt: 1 }}
              />
            </Grid>
          </Grid>
        </FormCard>

        <FormCard
          accentColor="#FFC010"
          accentColorEnd="#E6AC00"
        >
          <FormSectionHeader
            icon={<BusinessIcon />}
            title="Partners"
            subtitle="Select partners participating in this event"
          />
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                multiple
                options={allPartners}
                getOptionLabel={(option) =>
                  `${option.name} (${option.tier})`
                }
                value={allPartners.filter((p) =>
                  selectedPartnerIds.includes(p._id)
                )}
                onChange={(_e, newValue) => {
                  setSelectedPartnerIds(newValue.map((p) => p._id));
                }}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      size="small"
                      {...getTagProps({ index })}
                      key={option._id}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Event Partners"
                    placeholder="Search partners..."
                    helperText="Select one or more partners contributing to this event"
                  />
                )}
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
            title="Status & Configuration"
            subtitle="Capacity and event status"
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
                        <PeopleOutlined
                          sx={{ color: "text.secondary", fontSize: 20 }}
                        />
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
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="open">Open for Registration</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="concluded">Concluded</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                label="Registration Form"
                value={selectedFormConfig}
                onChange={(e) => setSelectedFormConfig(e.target.value)}
                helperText="Select a registration form for this event. Manage forms in Settings."
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AssignmentIcon
                          sx={{ color: "text.secondary", fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              >
                <MenuItem value="">
                  <em>Default (basic registration)</em>
                </MenuItem>
                {registrationForms.map((form) => (
                  <MenuItem key={form._id} value={form._id}>
                    {form.name} ({form.slug})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </FormCard>

        <FormActions>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() => router.push("/admin/events")}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </FormActions>
      </form>
    </Container>
  );
}
