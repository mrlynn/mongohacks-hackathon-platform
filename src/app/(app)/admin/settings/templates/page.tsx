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
  IconButton,
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
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface TemplateConfig {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isBuiltIn: boolean;
  isDefault: boolean;
  colors: { primary: string; secondary: string; heroBg: string; heroBgEnd: string; background: string };
  cards: { style: string };
  hero: { style: string };
}

export default function TemplateListPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; template: TemplateConfig | null }>({
    open: false,
    template: null,
  });
  const [createDialog, setCreateDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateSlug, setNewTemplateSlug] = useState("");

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/admin/templates");
      const data = await res.json();
      if (data.success) setTemplates(data.templates);
    } catch {
      setSnackbar({ open: true, message: "Failed to load templates", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleClone = async (template: TemplateConfig) => {
    try {
      const res = await fetch(`/api/admin/templates/${template._id}/clone`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: `Cloned "${template.name}"`, severity: "success" });
        fetchTemplates();
      } else {
        setSnackbar({ open: true, message: data.error, severity: "error" });
      }
    } catch {
      setSnackbar({ open: true, message: "Failed to clone template", severity: "error" });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.template) return;
    try {
      const res = await fetch(`/api/admin/templates/${deleteDialog.template._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: "Template deleted", severity: "success" });
        setDeleteDialog({ open: false, template: null });
        fetchTemplates();
      } else {
        setSnackbar({ open: true, message: data.error, severity: "error" });
      }
    } catch {
      setSnackbar({ open: true, message: "Failed to delete template", severity: "error" });
    }
  };

  const handleSetDefault = async (template: TemplateConfig) => {
    try {
      const res = await fetch(`/api/admin/templates/${template._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: `"${template.name}" set as default`, severity: "success" });
        fetchTemplates();
      }
    } catch {
      setSnackbar({ open: true, message: "Failed to set default", severity: "error" });
    }
  };

  const handleCreate = async () => {
    if (!newTemplateName || !newTemplateSlug) return;
    try {
      // Clone the default template as base, then create
      const defaultTemplate = templates.find((t) => t.isDefault) || templates[0];
      if (defaultTemplate) {
        const res = await fetch(`/api/admin/templates/${defaultTemplate._id}/clone`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newTemplateName, slug: newTemplateSlug }),
        });
        const data = await res.json();
        if (data.success) {
          setCreateDialog(false);
          setNewTemplateName("");
          setNewTemplateSlug("");
          router.push(`/admin/settings/templates/${data.template._id}/edit`);
        } else {
          setSnackbar({ open: true, message: data.error, severity: "error" });
        }
      }
    } catch {
      setSnackbar({ open: true, message: "Failed to create template", severity: "error" });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const builtIn = templates.filter((t) => t.isBuiltIn);
  const custom = templates.filter((t) => !t.isBuiltIn);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
            Landing Page Templates
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and customize templates for event landing pages
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialog(true)}
          sx={{ fontWeight: 600 }}
        >
          Create Template
        </Button>
      </Box>

      {/* Built-in Templates */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 4 }}>
        Built-in Templates
      </Typography>
      <Grid container spacing={3}>
        {builtIn.map((template) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={template._id}>
            <TemplateCard
              template={template}
              onEdit={() => router.push(`/admin/settings/templates/${template._id}/edit`)}
              onClone={() => handleClone(template)}
              onDelete={null}
              onSetDefault={() => handleSetDefault(template)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Custom Templates */}
      {custom.length > 0 && (
        <>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 4 }}>
            Custom Templates
          </Typography>
          <Grid container spacing={3}>
            {custom.map((template) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={template._id}>
                <TemplateCard
                  template={template}
                  onEdit={() => router.push(`/admin/settings/templates/${template._id}/edit`)}
                  onClone={() => handleClone(template)}
                  onDelete={() => setDeleteDialog({ open: true, template })}
                  onSetDefault={() => handleSetDefault(template)}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Create New Template</DialogTitle>
        <DialogContent>
          <TextField
            label="Template Name"
            fullWidth
            value={newTemplateName}
            onChange={(e) => {
              setNewTemplateName(e.target.value);
              setNewTemplateSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
            }}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            label="Slug"
            fullWidth
            value={newTemplateSlug}
            onChange={(e) => setNewTemplateSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            helperText="URL-friendly identifier (lowercase, hyphens only)"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!newTemplateName || !newTemplateSlug}
          >
            Create & Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, template: null })}>
        <DialogTitle>Delete Template?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{deleteDialog.template?.name}&quot;? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, template: null })}>Cancel</Button>
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
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function TemplateCard({
  template,
  onEdit,
  onClone,
  onDelete,
  onSetDefault,
}: {
  template: TemplateConfig;
  onEdit: () => void;
  onClone: () => void;
  onDelete: (() => void) | null;
  onSetDefault: () => void;
}) {
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
      {/* Color preview bar */}
      <Box
        sx={{
          height: 64,
          background: `linear-gradient(135deg, ${template.colors.heroBg} 0%, ${template.colors.heroBgEnd} 100%)`,
          position: "relative",
        }}
      >
        <Stack direction="row" spacing={0.5} sx={{ position: "absolute", bottom: 8, left: 12 }}>
          {[template.colors.primary, template.colors.secondary, template.colors.background].map((color, i) => (
            <Box
              key={i}
              sx={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                bgcolor: color,
                border: "2px solid rgba(255,255,255,0.8)",
              }}
            />
          ))}
        </Stack>
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
            {template.name}
          </Typography>
          <IconButton
            size="small"
            onClick={onSetDefault}
            color={template.isDefault ? "warning" : "default"}
            title={template.isDefault ? "Default template" : "Set as default"}
          >
            {template.isDefault ? <StarIcon /> : <StarBorderIcon />}
          </IconButton>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
          {template.isBuiltIn && <Chip label="Built-in" size="small" color="info" variant="outlined" />}
          {template.isDefault && <Chip label="Default" size="small" color="warning" />}
          <Chip label={template.cards.style} size="small" variant="outlined" />
          <Chip label={template.hero.style} size="small" variant="outlined" />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {template.description}
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
          <Button size="small" startIcon={<DeleteIcon />} color="error" onClick={onDelete}>
            Delete
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
