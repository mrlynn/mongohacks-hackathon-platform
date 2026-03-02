"use client";

import { useEffect, useState, useCallback } from "react";
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
  Collapse,
  Tooltip,
  Link as MuiLink,
} from "@mui/material";
import {
  Edit as EditIcon,
  ContentCopy as CloneIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Visibility as PreviewIcon,
  Language as LandingPageIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  OpenInNew as OpenInNewIcon,
  Close as CloseIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import DynamicTemplate from "@/components/landing-pages/DynamicTemplate";
import { ITemplateConfig } from "@/lib/db/models/TemplateConfig";

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

interface TemplateEvent {
  _id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  landingPage?: {
    slug: string;
    published: boolean;
  };
}

// Sample event data for template preview
const sampleEvent = {
  _id: "preview",
  name: "MongoDB Hackathon 2026",
  description: "Build the next generation of database-powered applications. Join developers from around the world for an unforgettable 48-hour coding experience.",
  startDate: "2026-06-15T09:00:00Z",
  endDate: "2026-06-17T18:00:00Z",
  location: "San Francisco, CA",
  landingPage: {
    customContent: {
      hero: {
        headline: "MongoDB Hackathon 2026",
        subheadline: "Build the future of data-driven applications",
        ctaText: "Register Now",
      },
      about: "Join us for an incredible 48-hour hackathon where developers, designers, and innovators come together to build the next generation of data-powered applications. Whether you're a seasoned pro or just starting out, this event is for you!",
      prizes: [
        { title: "1st Place", description: "Grand Prize Winner", value: "$5,000" },
        { title: "2nd Place", description: "Runner Up", value: "$2,500" },
        { title: "3rd Place", description: "Third Place", value: "$1,000" },
      ],
      schedule: [
        { time: "9:00 AM", title: "Opening Ceremony", description: "Welcome and team formation" },
        { time: "10:00 AM", title: "Hacking Begins", description: "Start building your projects" },
        { time: "12:00 PM", title: "Lunch Break", description: "Refuel and network" },
        { time: "6:00 PM", title: "Submissions Due", description: "Final project submissions" },
        { time: "7:00 PM", title: "Awards Ceremony", description: "Winner announcements" },
      ],
      sponsors: [
        { name: "MongoDB", logo: "/mongodb-logo.svg", tier: "Gold" },
        { name: "Vercel", logo: "/vercel-logo.svg", tier: "Silver" },
        { name: "GitHub", logo: "/github-logo.svg", tier: "Silver" },
      ],
      faq: [
        { question: "Who can participate?", answer: "Anyone with a passion for coding! All skill levels are welcome." },
        { question: "Do I need a team?", answer: "You can join solo or form teams of up to 5. We'll help match solo participants with teams." },
        { question: "What should I bring?", answer: "Your laptop, charger, and creativity! Food and drinks will be provided." },
      ],
    },
  },
};

export default function TemplateListPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateConfig[]>([]);
  const [fullTemplates, setFullTemplates] = useState<Record<string, ITemplateConfig>>({});
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
  const [previewTemplate, setPreviewTemplate] = useState<TemplateConfig | null>(null);
  const [templateEvents, setTemplateEvents] = useState<Record<string, TemplateEvent[]>>({});
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [loadingEvents, setLoadingEvents] = useState<Record<string, boolean>>({});

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

  const fetchFullTemplate = useCallback(async (templateId: string) => {
    if (fullTemplates[templateId]) return fullTemplates[templateId];
    try {
      const res = await fetch(`/api/admin/templates/${templateId}`);
      const data = await res.json();
      if (data.success) {
        setFullTemplates((prev) => ({ ...prev, [templateId]: data.template }));
        return data.template;
      }
    } catch {
      // ignore
    }
    return null;
  }, [fullTemplates]);

  const fetchEventsForTemplate = useCallback(async (templateId: string) => {
    if (templateEvents[templateId] !== undefined) return;
    setLoadingEvents((prev) => ({ ...prev, [templateId]: true }));
    try {
      const res = await fetch(`/api/admin/templates/${templateId}/events`);
      const data = await res.json();
      if (data.success) {
        setTemplateEvents((prev) => ({ ...prev, [templateId]: data.events }));
      }
    } catch {
      setTemplateEvents((prev) => ({ ...prev, [templateId]: [] }));
    } finally {
      setLoadingEvents((prev) => ({ ...prev, [templateId]: false }));
    }
  }, [templateEvents]);

  const handlePreview = async (template: TemplateConfig) => {
    setPreviewTemplate(template);
    await fetchFullTemplate(template._id);
  };

  const handleToggleEvents = async (template: TemplateConfig) => {
    const isExpanded = expandedEvents[template._id];
    setExpandedEvents((prev) => ({ ...prev, [template._id]: !isExpanded }));
    if (!isExpanded) {
      await fetchEventsForTemplate(template._id);
    }
  };

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
              onPreview={() => handlePreview(template)}
              onToggleEvents={() => handleToggleEvents(template)}
              eventsExpanded={expandedEvents[template._id] || false}
              events={templateEvents[template._id]}
              loadingEvents={loadingEvents[template._id] || false}
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
                  onPreview={() => handlePreview(template)}
                  onToggleEvents={() => handleToggleEvents(template)}
                  eventsExpanded={expandedEvents[template._id] || false}
                  events={templateEvents[template._id]}
                  loadingEvents={loadingEvents[template._id] || false}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Template Preview Dialog */}
      <Dialog
        open={previewTemplate !== null}
        onClose={() => setPreviewTemplate(null)}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            maxWidth: "95vw",
            height: "90vh",
            m: 2,
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
          <Box>
            <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
              Preview: {previewTemplate?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }} component="span">
              (Sample data)
            </Typography>
          </Box>
          <IconButton onClick={() => setPreviewTemplate(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, overflow: "auto" }}>
          {previewTemplate && fullTemplates[previewTemplate._id] ? (
            <DynamicTemplate
              config={fullTemplates[previewTemplate._id]}
              event={sampleEvent}
            />
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
      </Dialog>

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
  onPreview,
  onToggleEvents,
  eventsExpanded,
  events,
  loadingEvents,
}: {
  template: TemplateConfig;
  onEdit: () => void;
  onClone: () => void;
  onDelete: (() => void) | null;
  onSetDefault: () => void;
  onPreview: () => void;
  onToggleEvents: () => void;
  eventsExpanded: boolean;
  events?: TemplateEvent[];
  loadingEvents: boolean;
}) {
  const eventCount = events?.length;

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
          cursor: "pointer",
        }}
        onClick={onPreview}
        title="Click to preview template"
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
        <Box sx={{ position: "absolute", top: 8, right: 8 }}>
          <Chip
            icon={<PreviewIcon sx={{ fontSize: 14 }} />}
            label="Preview"
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.9)",
              fontSize: "0.7rem",
              height: 24,
              "& .MuiChip-icon": { ml: 0.5 },
            }}
          />
        </Box>
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

        <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: "wrap", gap: 0.5 }}>
          {template.isBuiltIn && <Chip label="Built-in" size="small" color="info" variant="outlined" />}
          {template.isDefault && <Chip label="Default" size="small" color="warning" />}
          <Chip label={template.cards.style} size="small" variant="outlined" />
          <Chip label={template.hero.style} size="small" variant="outlined" />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {template.description}
        </Typography>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 1, flexWrap: "wrap" }}>
        <Button size="small" startIcon={<EditIcon />} onClick={onEdit}>
          Edit
        </Button>
        <Button size="small" startIcon={<PreviewIcon />} onClick={onPreview}>
          Preview
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

      {/* Landing Pages Toggle */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Button
          size="small"
          fullWidth
          variant="outlined"
          startIcon={<LandingPageIcon />}
          endIcon={eventsExpanded ? <CollapseIcon /> : <ExpandIcon />}
          onClick={onToggleEvents}
          sx={{
            justifyContent: "space-between",
            textTransform: "none",
            fontSize: "0.8rem",
            borderColor: "divider",
            color: "text.secondary",
          }}
        >
          Landing Pages {eventCount !== undefined ? `(${eventCount})` : ""}
        </Button>

        <Collapse in={eventsExpanded}>
          <Box sx={{ mt: 1.5 }}>
            {loadingEvents ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
                <CircularProgress size={20} />
              </Box>
            ) : events && events.length > 0 ? (
              <Stack spacing={1}>
                {events.map((event) => (
                  <Box
                    key={event._id}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: "action.hover",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Tooltip title={event.landingPage?.published ? "Published" : "Draft"}>
                      <CircleIcon
                        sx={{
                          fontSize: 10,
                          color: event.landingPage?.published ? "success.main" : "warning.main",
                          flexShrink: 0,
                        }}
                      />
                    </Tooltip>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.3 }} noWrap>
                        {event.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(event.startDate).toLocaleDateString()}
                        {" \u2022 "}
                        <Chip
                          label={event.status}
                          size="small"
                          sx={{ height: 16, fontSize: "0.65rem" }}
                          color={
                            event.status === "open" ? "success" :
                            event.status === "in_progress" ? "info" :
                            event.status === "concluded" ? "default" : "warning"
                          }
                        />
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                      {event.landingPage?.slug && (
                        <Tooltip title={event.landingPage.published ? "View live page" : "Preview draft"}>
                          <IconButton
                            size="small"
                            component="a"
                            href={`/${event.landingPage.slug}${event.landingPage.published ? "" : "?preview=true"}`}
                            target="_blank"
                          >
                            <OpenInNewIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Edit landing page">
                        <IconButton
                          size="small"
                          component="a"
                          href={`/admin/events/${event._id}/landing-page`}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 1, fontSize: "0.8rem" }}>
                No events using this template yet
              </Typography>
            )}
          </Box>
        </Collapse>
      </Box>
    </Card>
  );
}
