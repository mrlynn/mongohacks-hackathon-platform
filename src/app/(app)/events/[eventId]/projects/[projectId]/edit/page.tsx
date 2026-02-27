"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  MenuItem,
  InputAdornment,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  RocketLaunchOutlined,
  TitleOutlined,
  CategoryOutlined,
  AutoAwesomeOutlined,
  GitHub as GitHubIcon,
  OpenInNewOutlined,
  MenuBookOutlined,
  LightbulbOutlined,
  LinkOutlined,
  CloudDone as SavedIcon,
  BuildOutlined,
  LockOpen as UnsubmitIcon,
  ImageOutlined,
} from "@mui/icons-material";
import { useParams, useRouter } from "next/navigation";
import { mongoColors } from "@/styles/theme";
import {
  PageHeader,
  FormCard,
  FormSectionHeader,
  ChipInput,
  FormActions,
} from "@/components/shared-ui/FormElements";

const categories = [
  "AI/ML",
  "Web Development",
  "Mobile Apps",
  "Blockchain/Web3",
  "IoT/Hardware",
  "Climate Tech",
  "HealthTech",
  "FinTech",
  "EdTech",
  "Social Impact",
  "Gaming",
  "DevTools",
  "Other",
];

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const projectId = params.projectId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [projectStatus, setProjectStatus] = useState<string>("draft");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    technologies: [] as string[],
    repoUrl: "",
    demoUrl: "",
    documentationUrl: "",
    thumbnailUrl: "",
    innovations: "",
  });

  // Load existing project data
  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(
          `/api/events/${eventId}/projects/${projectId}`
        );
        if (!res.ok) {
          setError("Failed to load project");
          return;
        }
        const data = await res.json();
        const project = data.project || data;
        setFormData({
          name: project.name || "",
          description: project.description || "",
          category: project.category || "",
          technologies: project.technologies || [],
          repoUrl: project.repoUrl || "",
          demoUrl: project.demoUrl || "",
          documentationUrl: project.documentationUrl || "",
          thumbnailUrl: project.thumbnailUrl || "",
          innovations: project.innovations || "",
        });
        setProjectStatus(project.status || "draft");
      } catch {
        setError("Failed to load project data");
      } finally {
        setLoading(false);
        // Mark initial load complete after a tick so the first formData
        // setState from load doesn't trigger auto-save
        setTimeout(() => {
          initialLoadRef.current = false;
        }, 100);
      }
    }
    loadProject();
  }, [eventId, projectId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Auto-save: debounced PATCH
  const autoSave = useCallback(async () => {
    if (!formData.name) return;

    setSaveStatus("saving");
    try {
      const response = await fetch(
        `/api/events/${eventId}/projects/${projectId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setSaveStatus("saved");
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    }
  }, [formData, eventId, projectId]);

  // Trigger auto-save on form changes (debounced 3 seconds), skip during load
  useEffect(() => {
    if (initialLoadRef.current) return;
    if (projectStatus === "submitted") return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      autoSave();
    }, 3000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData, autoSave, projectStatus]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Please enter a project name");
      return;
    }
    await autoSave();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Save latest changes first
      await autoSave();

      // Then submit
      const response = await fetch(
        `/api/events/${eventId}/projects/${projectId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "submit" }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to submit project");
        return;
      }

      router.push(`/events/${eventId}/hub`);
    } catch {
      setError("An error occurred while submitting");
    } finally {
      setSaving(false);
    }
  };

  const handleUnsubmit = async () => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/events/${eventId}/projects/${projectId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "unsubmit" }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setProjectStatus("draft");
      } else {
        setError(data.error || "Failed to unsubmit project");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const isSubmitted = projectStatus === "submitted";

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <PageHeader
          icon={<RocketLaunchOutlined />}
          title="Edit Project"
          subtitle={
            isSubmitted
              ? "This project has been submitted. Unsubmit to make changes."
              : "Update your hackathon project"
          }
        />
        {!isSubmitted && (
          <Chip
            icon={saveStatus === "saved" ? <SavedIcon /> : undefined}
            label={
              saveStatus === "saving"
                ? "Saving..."
                : saveStatus === "saved"
                  ? "Saved"
                  : saveStatus === "error"
                    ? "Save failed"
                    : ""
            }
            size="small"
            color={saveStatus === "error" ? "error" : "default"}
            variant="outlined"
            sx={{ mt: 1 }}
          />
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {isSubmitted && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<UnsubmitIcon />}
              onClick={handleUnsubmit}
              disabled={saving}
            >
              Unsubmit to Edit
            </Button>
          }
        >
          This project has been submitted for judging. Unsubmit it to make
          changes.
        </Alert>
      )}

      <form>
        <fieldset
          disabled={isSubmitted}
          style={{ border: "none", padding: 0, margin: 0 }}
        >
          <FormCard>
            <FormSectionHeader
              icon={<LightbulbOutlined />}
              title="Project Information"
              subtitle="Tell us about what you built"
            />

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Project Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Smart City Dashboard"
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
                  multiline
                  rows={5}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe your project, what problem it solves, and how it works..."
                  helperText={`${formData.description.length}/5000 characters (minimum 20)`}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryOutlined
                            sx={{ color: "text.secondary", fontSize: 20 }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <ChipInput
                  label="Technologies Used"
                  placeholder="e.g., MongoDB, React, Python"
                  values={formData.technologies}
                  onChange={(techs) =>
                    setFormData((prev) => ({ ...prev, technologies: techs }))
                  }
                  icon={
                    <BuildOutlined
                      sx={{ color: "text.secondary", fontSize: 20 }}
                    />
                  }
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Key Innovations"
                  name="innovations"
                  value={formData.innovations}
                  onChange={handleChange}
                  placeholder="What makes your project unique? What technical challenges did you solve?"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment
                          position="start"
                          sx={{ alignSelf: "flex-start", mt: 1.5 }}
                        >
                          <AutoAwesomeOutlined
                            sx={{ color: "text.secondary", fontSize: 20 }}
                          />
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
            accentColorEnd={mongoColors.purple.main}
          >
            <FormSectionHeader
              icon={<LinkOutlined />}
              title="Links & Resources"
              subtitle="Share your project's code and demo"
            />

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Repository URL"
                  name="repoUrl"
                  value={formData.repoUrl}
                  onChange={handleChange}
                  required
                  placeholder="https://github.com/username/project"
                  helperText="Must be a valid GitHub URL"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <GitHubIcon
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
                  label="Demo URL (optional)"
                  name="demoUrl"
                  value={formData.demoUrl}
                  onChange={handleChange}
                  placeholder="https://demo.example.com"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <OpenInNewOutlined
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
                  label="Documentation URL (optional)"
                  name="documentationUrl"
                  value={formData.documentationUrl}
                  onChange={handleChange}
                  placeholder="https://docs.example.com"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <MenuBookOutlined
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
                  label="Thumbnail Image URL (optional)"
                  name="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/screenshot.png"
                  helperText="A screenshot or image of your project for the gallery"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <ImageOutlined
                            sx={{ color: "text.secondary", fontSize: 20 }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
            </Grid>
          </FormCard>
        </fieldset>

        <FormActions>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() =>
              router.push(`/events/${eventId}/projects/${projectId}`)
            }
            disabled={saving}
          >
            Cancel
          </Button>
          {!isSubmitted && (
            <>
              <Button
                variant="text"
                startIcon={<SavedIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                Save
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? "Submitting..." : "Submit Project"}
              </Button>
            </>
          )}
        </FormActions>
      </form>
    </Box>
  );
}
