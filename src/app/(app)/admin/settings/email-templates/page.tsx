"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Email as EmailIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

interface EmailTemplate {
  _id: string;
  key: string;
  name: string;
  category: string;
  description: string;
  subject: string;
  isBuiltIn: boolean;
  updatedBy?: { name: string };
  updatedAt: string;
}

const CATEGORY_COLORS: Record<string, "primary" | "success" | "warning" | "info"> = {
  auth: "primary",
  event: "success",
  partner: "warning",
  notification: "info",
};

export default function EmailTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<EmailTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      const url = categoryFilter
        ? `/api/admin/email-templates?category=${categoryFilter}`
        : "/api/admin/email-templates";
      const res = await fetch(url);
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch {
      setError("Failed to load email templates");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/email-templates/${deleteDialog._id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      setDeleteDialog(null);
      fetchTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
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
          <EmailIcon color="primary" />
          <Typography variant="h5" fontWeight={700}>
            Email Templates
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={categoryFilter}
          exclusive
          onChange={(_e, val) => setCategoryFilter(val)}
          size="small"
        >
          <ToggleButton value={null as unknown as string}>All</ToggleButton>
          <ToggleButton value="auth">Auth</ToggleButton>
          <ToggleButton value="event">Event</ToggleButton>
          <ToggleButton value="partner">Partner</ToggleButton>
          <ToggleButton value="notification">Notification</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <TableContainer component={Card} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Key</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                  <Typography color="text.secondary">No templates found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              templates.map((t) => (
                <TableRow key={t._id} hover>
                  <TableCell>
                    <Typography fontWeight={500}>{t.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {t.key}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t.category}
                      size="small"
                      color={CATEGORY_COLORS[t.category] || "default"}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.subject}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(t.updatedAt).toLocaleDateString()}
                    </Typography>
                    {t.updatedBy && (
                      <Typography variant="caption" color="text.secondary">
                        by {t.updatedBy.name}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => router.push(`/admin/settings/email-templates/${t._id}/edit`)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    {!t.isBuiltIn && (
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => setDeleteDialog(t)}
                      >
                        Delete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the template &quot;{deleteDialog?.name}&quot;? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
