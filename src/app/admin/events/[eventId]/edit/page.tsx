"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";

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
  }, []);

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
      } else {
        setError("Failed to load event");
      }
    } catch (err) {
      setError("Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          registrationDeadline: new Date(formData.registrationDeadline).toISOString(),
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
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Edit Event
      </Typography>

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

      <Card>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Theme"
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
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

              <Grid item xs={12} md={4}>
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

              <Grid item xs={12} md={4}>
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

              <Grid item xs={12} md={4}>
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

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  helperText="City, State/Country"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  helperText="Specific venue name (optional)"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
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

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isVirtual"
                      checked={formData.isVirtual}
                      onChange={handleChange}
                    />
                  }
                  label="Virtual Event"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.push("/admin/events")}
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
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
