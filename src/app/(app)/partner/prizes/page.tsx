"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  EmojiEvents as PrizeIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

interface Prize {
  _id: string;
  title: string;
  description: string;
  category: string;
  value: string;
  monetaryValue: number;
  isActive: boolean;
  eligibility?: string;
  criteria?: string[];
  eventId: { _id: string; name: string; status: string } | string;
  createdAt: string;
}

interface PartnerEvent {
  _id: string;
  name: string;
  status: string;
}

const emptyForm = {
  eventId: "",
  title: "",
  description: "",
  value: "",
  monetaryValue: 0,
  eligibility: "",
  criteria: "",
};

export default function PartnerPrizesPage() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [events, setEvents] = useState<PartnerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPrizes = useCallback(async () => {
    try {
      const res = await fetch("/api/partner/prizes");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load prizes");
      setPrizes(data.prizes || []);
      setEvents(data.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load prizes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrizes();
  }, [fetchPrizes]);

  const handleOpen = (prize?: Prize) => {
    if (prize) {
      setEditingId(prize._id);
      setForm({
        eventId: typeof prize.eventId === "object" ? prize.eventId._id : prize.eventId,
        title: prize.title,
        description: prize.description,
        value: prize.value || "",
        monetaryValue: prize.monetaryValue || 0,
        eligibility: prize.eligibility || "",
        criteria: prize.criteria?.join(", ") || "",
      });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        monetaryValue: Number(form.monetaryValue) || 0,
        criteria: form.criteria ? form.criteria.split(",").map((c) => c.trim()).filter(Boolean) : [],
      };

      const url = editingId ? `/api/partner/prizes/${editingId}` : "/api/partner/prizes";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setDialogOpen(false);
      fetchPrizes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save prize");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (prizeId: string) => {
    if (!confirm("Are you sure you want to delete this prize?")) return;
    try {
      await fetch(`/api/partner/prizes/${prizeId}`, { method: "DELETE" });
      fetchPrizes();
    } catch {
      setError("Failed to delete prize");
    }
  };

  const handleToggleActive = async (prize: Prize) => {
    try {
      await fetch(`/api/partner/prizes/${prize._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !prize.isActive }),
      });
      fetchPrizes();
    } catch {
      setError("Failed to update prize");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PrizeIcon color="primary" />
          <Typography variant="h5" fontWeight={700}>
            Prize Management
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Create Prize
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your sponsored prizes across all events. Create, edit, and track prizes you offer.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      {prizes.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <PrizeIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              No prizes created yet. Start by creating your first sponsored prize.
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleOpen()}>
              Create Your First Prize
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Card} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Event</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prizes.map((prize) => (
                <TableRow key={prize._id}>
                  <TableCell>
                    <Typography fontWeight={500}>{prize.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {prize.description.slice(0, 60)}{prize.description.length > 60 ? "..." : ""}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {typeof prize.eventId === "object" ? prize.eventId.name : "--"}
                  </TableCell>
                  <TableCell>{prize.value || "--"}</TableCell>
                  <TableCell>
                    <Switch
                      checked={prize.isActive}
                      onChange={() => handleToggleActive(prize)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpen(prize)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(prize._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Edit Prize" : "Create Prize"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {!editingId && (
              <FormControl required>
                <InputLabel>Event</InputLabel>
                <Select
                  value={form.eventId}
                  label="Event"
                  onChange={(e) => setForm({ ...form, eventId: e.target.value as string })}
                >
                  {events.map((event) => (
                    <MenuItem key={event._id} value={event._id}>
                      {event.name} ({event.status.replace("_", " ")})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              multiline
              rows={3}
            />
            <TextField
              label="Value (e.g., '$5,000' or 'MacBook Pro')"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />
            <TextField
              label="Monetary Value ($)"
              type="number"
              value={form.monetaryValue}
              onChange={(e) => setForm({ ...form, monetaryValue: Number(e.target.value) })}
            />
            <TextField
              label="Eligibility"
              value={form.eligibility}
              onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
              multiline
              rows={2}
            />
            <TextField
              label="Criteria (comma-separated)"
              value={form.criteria}
              onChange={(e) => setForm({ ...form, criteria: e.target.value })}
              helperText="e.g., Innovation, Use of MongoDB, Presentation"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.title || !form.description || (!editingId && !form.eventId)}>
            {saving ? "Saving..." : editingId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
