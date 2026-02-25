"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  ContentCopy as CloneIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface FormConfig {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isBuiltIn: boolean;
  tier1: {
    showExperienceLevel: boolean;
    customQuestions: unknown[];
  };
  tier2: {
    enabled: boolean;
    prompt: string;
    showSkills: boolean;
    showGithub: boolean;
    showBio: boolean;
    customQuestions: unknown[];
  };
  tier3: {
    enabled: boolean;
    prompt: string;
    customQuestions: unknown[];
  };
}

export default function RegistrationFormsListPage() {
  const router = useRouter();
  const [forms, setForms] = useState<FormConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    form: FormConfig | null;
  }>({ open: false, form: null });
  const [createDialog, setCreateDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");

  const fetchForms = async () => {
    try {
      const res = await fetch("/api/admin/registration-forms");
      const data = await res.json();
      if (data.success) setForms(data.forms);
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to load registration forms",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleClone = async (form: FormConfig) => {
    try {
      const res = await fetch(
        `/api/admin/registration-forms/${form._id}/clone`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.success) {
        setSnackbar({
          open: true,
          message: `Cloned "${form.name}"`,
          severity: "success",
        });
        fetchForms();
      } else {
        setSnackbar({ open: true, message: data.error, severity: "error" });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to clone form",
        severity: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.form) return;
    try {
      const res = await fetch(
        `/api/admin/registration-forms/${deleteDialog.form._id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        setSnackbar({
          open: true,
          message: "Form deleted",
          severity: "success",
        });
        setDeleteDialog({ open: false, form: null });
        fetchForms();
      } else {
        setSnackbar({ open: true, message: data.error, severity: "error" });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to delete form",
        severity: "error",
      });
    }
  };

  const handleCreate = async () => {
    if (!newName || !newSlug) return;
    try {
      const res = await fetch("/api/admin/registration-forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          slug: newSlug,
          description: "",
          tier1: { showExperienceLevel: true, customQuestions: [] },
          tier2: {
            enabled: true,
            prompt: "Tell us more about yourself",
            showSkills: true,
            showGithub: true,
            showBio: true,
            customQuestions: [],
          },
          tier3: { enabled: false, prompt: "", customQuestions: [] },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreateDialog(false);
        setNewName("");
        setNewSlug("");
        router.push(
          `/admin/settings/registration-forms/${data.form._id}/edit`
        );
      } else {
        setSnackbar({ open: true, message: data.error, severity: "error" });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to create form",
        severity: "error",
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const builtIn = forms.filter((f) => f.isBuiltIn);
  const custom = forms.filter((f) => !f.isBuiltIn);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
            Registration Forms
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and customize multi-step registration forms for events
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialog(true)}
          sx={{ fontWeight: 600 }}
        >
          Create Form
        </Button>
      </Box>

      {forms.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No registration forms found. Create one to get started.
        </Alert>
      )}

      {builtIn.length > 0 && (
        <>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 4 }}>
            Built-in Forms
          </Typography>
          <Grid container spacing={3}>
            {builtIn.map((form) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={form._id}>
                <FormCard
                  form={form}
                  onEdit={() =>
                    router.push(
                      `/admin/settings/registration-forms/${form._id}/edit`
                    )
                  }
                  onClone={() => handleClone(form)}
                  onDelete={null}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {custom.length > 0 && (
        <>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 4 }}>
            Custom Forms
          </Typography>
          <Grid container spacing={3}>
            {custom.map((form) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={form._id}>
                <FormCard
                  form={form}
                  onEdit={() =>
                    router.push(
                      `/admin/settings/registration-forms/${form._id}/edit`
                    )
                  }
                  onClone={() => handleClone(form)}
                  onDelete={() => setDeleteDialog({ open: true, form })}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Create Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Create Registration Form
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Form Name"
            fullWidth
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setNewSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "")
              );
            }}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            label="Slug"
            fullWidth
            value={newSlug}
            onChange={(e) =>
              setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
            }
            helperText="URL-friendly identifier (lowercase, hyphens only)"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!newName || !newSlug}
          >
            Create & Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, form: null })}
      >
        <DialogTitle>Delete Registration Form?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{deleteDialog.form?.name}
            &quot;? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, form: null })}
          >
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function FormCard({
  form,
  onEdit,
  onClone,
  onDelete,
}: {
  form: FormConfig;
  onEdit: () => void;
  onClone: () => void;
  onDelete: (() => void) | null;
}) {
  const tierCount =
    1 + (form.tier2.enabled ? 1 : 0) + (form.tier3.enabled ? 1 : 0);
  const questionCount =
    form.tier1.customQuestions.length +
    form.tier2.customQuestions.length +
    form.tier3.customQuestions.length;

  return (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease",
        "&:hover": { transform: "translateY(-2px)", boxShadow: 6 },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, flexGrow: 1 }}
          >
            {form.name}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: "wrap" }}>
          {form.isBuiltIn && (
            <Chip
              label="Built-in"
              size="small"
              color="info"
              variant="outlined"
            />
          )}
          <Chip
            label={`${tierCount} Tier${tierCount > 1 ? "s" : ""}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          {questionCount > 0 && (
            <Chip
              label={`${questionCount} Custom Q${questionCount > 1 ? "s" : ""}`}
              size="small"
              variant="outlined"
            />
          )}
          {form.tier1.showExperienceLevel && (
            <Chip label="Exp. Level" size="small" variant="outlined" />
          )}
          {form.tier2.enabled && form.tier2.showSkills && (
            <Chip label="Skills" size="small" variant="outlined" />
          )}
          {form.tier2.enabled && form.tier2.showGithub && (
            <Chip label="GitHub" size="small" variant="outlined" />
          )}
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.6 }}
        >
          {form.description || `${form.slug}`}
        </Typography>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button size="small" startIcon={<EditIcon />} onClick={onEdit}>
          Edit
        </Button>
        <Button size="small" startIcon={<CloneIcon />} onClick={onClone}>
          Clone
        </Button>
        {onDelete && (
          <Button
            size="small"
            startIcon={<DeleteIcon />}
            color="error"
            onClick={onDelete}
          >
            Delete
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
