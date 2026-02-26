"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  MenuItem,
  InputAdornment,
  Chip,
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
  CloudUploadOutlined,
  CloudDone as SavedIcon,
  BuildOutlined,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
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

export default function NewProjectPage({
  params,
}: {
  params: { eventId: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    technologies: [] as string[],
    repoUrl: "",
    demoUrl: "",
    documentationUrl: "",
    innovations: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Auto-save: debounced PATCH to server when project exists as draft
  const autoSave = useCallback(async () => {
    if (!projectId || !formData.name) return;

    setSaveStatus("saving");
    try {
      const response = await fetch(
        `/api/events/${params.eventId}/projects/${projectId}`,
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
  }, [projectId, formData, params.eventId]);

  // Trigger auto-save on form changes (debounced 3 seconds)
  useEffect(() => {
    if (!projectId) return;

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
  }, [formData, projectId, autoSave]);

  // Create draft project initially
  const createDraft = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/events/${params.eventId}/projects`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            status: "draft",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setProjectId(data.project._id);
        setSaveStatus("saved");
        return data.project._id;
      } else {
        setError(data.error || data.message || "Failed to save draft");
        return null;
      }
    } catch (err) {
      setError("An error occurred while saving the draft");
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      setError("Please enter a project name before saving");
      return;
    }

    if (projectId) {
      await autoSave();
    } else {
      await createDraft();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let id = projectId;

      // If no draft yet, create project directly as submitted
      if (!id) {
        const response = await fetch(
          `/api/events/${params.eventId}/projects`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...formData,
              status: "submitted",
              submissionDate: new Date(),
            }),
          }
        );

        const data = await response.json();

        if (!data.success) {
          setError(data.error || data.message || "Failed to submit project");
          return;
        }

        id = data.project._id;
      } else {
        // Save latest changes first
        await autoSave();

        // Then submit
        const response = await fetch(
          `/api/events/${params.eventId}/projects/${id}`,
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
      }

      router.push(`/events/${params.eventId}/hub`);
    } catch (err) {
      setError("An error occurred while submitting the project");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <PageHeader
          icon={<RocketLaunchOutlined />}
          title="Submit Your Project"
          subtitle="Share your hackathon project with the judges"
        />
        {/* Auto-save indicator */}
        {projectId && (
          <Chip
            icon={saveStatus === "saved" ? <SavedIcon /> : undefined}
            label={
              saveStatus === "saving" ? "Saving..." :
              saveStatus === "saved" ? "Saved" :
              saveStatus === "error" ? "Save failed" : ""
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

      <form>
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
          </Grid>
        </FormCard>

        <FormActions>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="text"
            startIcon={<CloudUploadOutlined />}
            onClick={handleSaveDraft}
            disabled={loading}
          >
            Save as Draft
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Project"}
          </Button>
        </FormActions>
      </form>
    </Box>
  );
}
