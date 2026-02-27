"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Paper,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  EmojiEvents as TrophyIcon,
  ArrowBack as BackIcon,
  Save as SaveIcon,
  DragIndicator as DragIcon,
} from "@mui/icons-material";
import Link from "next/link";

const CATEGORIES = [
  { value: "grand", label: "Grand Prize", color: "warning" as const },
  { value: "track", label: "Track Prize", color: "primary" as const },
  { value: "sponsor", label: "Sponsor Prize", color: "secondary" as const },
  { value: "special", label: "Special Award", color: "info" as const },
  { value: "community", label: "Community Choice", color: "success" as const },
];

interface Partner {
  _id: string;
  name: string;
  tier: string;
  logo?: string;
}

interface Prize {
  _id: string;
  title: string;
  description: string;
  category: string;
  value?: string;
  monetaryValue?: number;
  eligibility?: string;
  criteria: string[];
  partnerId?: { _id: string; name: string; tier: string } | null;
  displayOrder: number;
  isActive: boolean;
  imageUrl?: string;
}

const emptyForm = {
  title: "",
  description: "",
  category: "grand",
  value: "",
  monetaryValue: "",
  eligibility: "",
  criteria: [] as string[],
  partnerId: "",
  displayOrder: 0,
  isActive: true,
  imageUrl: "",
};

export default function PrizesPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;

  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  // Criteria tag input
  const [criterionInput, setCriterionInput] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prizesRes, eventRes, partnersRes] = await Promise.all([
        fetch(`/api/prizes?eventId=${eventId}`),
        fetch(`/api/admin/events/${eventId}`),
        fetch("/api/partners?status=active&limit=200"),
      ]);

      const [prizesData, eventData, partnersData] = await Promise.all([
        prizesRes.json(),
        eventRes.json(),
        partnersRes.json(),
      ]);

      if (prizesRes.ok) setPrizes(prizesData.prizes || []);
      if (eventRes.ok && eventData.event) setEventName(eventData.event.name);
      if (partnersRes.ok) setPartners(partnersData.partners || []);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditingPrize(null);
    setForm({ ...emptyForm, displayOrder: prizes.length });
    setCriterionInput("");
    setDialogOpen(true);
  };

  const openEdit = (prize: Prize) => {
    setEditingPrize(prize);
    setForm({
      title: prize.title,
      description: prize.description,
      category: prize.category,
      value: prize.value || "",
      monetaryValue: prize.monetaryValue?.toString() || "",
      eligibility: prize.eligibility || "",
      criteria: prize.criteria || [],
      partnerId: prize.partnerId?._id || "",
      displayOrder: prize.displayOrder,
      isActive: prize.isActive,
      imageUrl: prize.imageUrl || "",
    });
    setCriterionInput("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        eventId,
        monetaryValue: form.monetaryValue ? Number(form.monetaryValue) : undefined,
        partnerId: form.partnerId || undefined,
        imageUrl: form.imageUrl || undefined,
        eligibility: form.eligibility || undefined,
      };

      let res: Response;
      if (editingPrize) {
        res = await fetch(`/api/prizes/${editingPrize._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/prizes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok) {
        setSuccess(editingPrize ? "Prize updated!" : "Prize created!");
        setDialogOpen(false);
        fetchData();
      } else {
        setError(data.error || "Failed to save prize");
      }
    } catch {
      setError("Failed to save prize");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (prize: Prize) => {
    if (!confirm(`Delete "${prize.title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/prizes/${prize._id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Prize deleted");
        fetchData();
      } else {
        setError(data.error || "Failed to delete prize");
      }
    } catch {
      setError("Failed to delete prize");
    }
  };

  const toggleActive = async (prize: Prize) => {
    try {
      const res = await fetch(`/api/prizes/${prize._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !prize.isActive }),
      });
      if (res.ok) fetchData();
    } catch {
      setError("Failed to update prize");
    }
  };

  const addCriterion = () => {
    const val = criterionInput.trim();
    if (val && !form.criteria.includes(val)) {
      setForm((prev) => ({ ...prev, criteria: [...prev.criteria, val] }));
    }
    setCriterionInput("");
  };

  const removeCriterion = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== idx),
    }));
  };

  const categoryMeta = (value: string) =>
    CATEGORIES.find((c) => c.value === value) || CATEGORIES[0];

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    prizes: prizes.filter((p) => p.category === cat.value),
  })).filter((g) => g.prizes.length > 0);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Prize Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Prize
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Typography color="text.secondary">Loading prizes...</Typography>
      ) : prizes.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <TrophyIcon sx={{ fontSize: 56, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No prizes yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add grand prizes, track prizes, sponsor awards, and more.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add First Prize
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {grouped.map((group) => (
            <Box key={group.value}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <TrophyIcon color={group.color} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {group.label}
                </Typography>
                <Chip label={group.prizes.length} size="small" />
              </Box>
              <Grid container spacing={2}>
                {group.prizes
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((prize) => (
                    <Grid key={prize._id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Card
                        sx={{
                          height: "100%",
                          opacity: prize.isActive ? 1 : 0.6,
                          border: 1,
                          borderColor: prize.isActive ? "divider" : "action.disabled",
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {prize.title}
                            </Typography>
                            <Box>
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => openEdit(prize)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDelete(prize)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>

                          {prize.value && (
                            <Typography
                              variant="h6"
                              color="success.main"
                              sx={{ fontWeight: 700, mb: 0.5 }}
                            >
                              {prize.value}
                            </Typography>
                          )}

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                          >
                            {prize.description}
                          </Typography>

                          {prize.partnerId && (
                            <Chip
                              label={`Sponsored by ${prize.partnerId.name}`}
                              size="small"
                              variant="outlined"
                              color="secondary"
                              sx={{ mb: 1 }}
                            />
                          )}

                          {prize.criteria && prize.criteria.length > 0 && (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
                              {prize.criteria.slice(0, 3).map((c) => (
                                <Chip key={c} label={c} size="small" variant="outlined" />
                              ))}
                              {prize.criteria.length > 3 && (
                                <Chip label={`+${prize.criteria.length - 3}`} size="small" />
                              )}
                            </Box>
                          )}

                          <FormControlLabel
                            control={
                              <Switch
                                size="small"
                                checked={prize.isActive}
                                onChange={() => toggleActive(prize)}
                              />
                            }
                            label={
                              <Typography variant="caption">
                                {prize.isActive ? "Active" : "Hidden"}
                              </Typography>
                            }
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            </Box>
          ))}
        </Box>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingPrize ? "Edit Prize" : "Add Prize"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
              fullWidth
              placeholder="1st Place — Best Use of MongoDB Atlas"
            />

            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={form.category}
                label="Category"
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              required
              fullWidth
              multiline
              rows={3}
              placeholder="Describe what this prize is awarded for..."
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Display Value"
                  value={form.value}
                  onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                  fullWidth
                  placeholder="$5,000 or MacBook Pro"
                  helperText="Shown on the landing page"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Monetary Value"
                  type="number"
                  value={form.monetaryValue}
                  onChange={(e) => setForm((p) => ({ ...p, monetaryValue: e.target.value }))}
                  fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  helperText="For sorting &amp; analytics"
                />
              </Grid>
            </Grid>

            {partners.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Sponsoring Partner (optional)</InputLabel>
                <Select
                  value={form.partnerId}
                  label="Sponsoring Partner (optional)"
                  onChange={(e) => setForm((p) => ({ ...p, partnerId: e.target.value }))}
                >
                  <MenuItem value="">
                    <em>No sponsor</em>
                  </MenuItem>
                  {partners.map((p) => (
                    <MenuItem key={p._id} value={p._id}>
                      {p.name} ({p.tier})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              label="Eligibility (optional)"
              value={form.eligibility}
              onChange={(e) => setForm((p) => ({ ...p, eligibility: e.target.value }))}
              fullWidth
              placeholder="Open to all participants / Teams of 2–4 members only"
            />

            {/* Criteria tags */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Judging Criteria Tags
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  value={criterionInput}
                  onChange={(e) => setCriterionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCriterion();
                    }
                  }}
                  placeholder="e.g. Innovation"
                  sx={{ flex: 1 }}
                />
                <Button size="small" variant="outlined" onClick={addCriterion}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {form.criteria.map((c, i) => (
                  <Chip
                    key={i}
                    label={c}
                    size="small"
                    onDelete={() => removeCriterion(i)}
                  />
                ))}
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Display Order"
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, displayOrder: Number(e.target.value) }))
                  }
                  fullWidth
                  helperText="Lower numbers appear first"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Image URL (optional)"
                  value={form.imageUrl}
                  onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                  fullWidth
                  placeholder="https://..."
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                />
              }
              label="Active (visible to participants)"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : editingPrize ? "Update Prize" : "Create Prize"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
