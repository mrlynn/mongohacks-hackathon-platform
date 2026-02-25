"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Chip,
  Divider,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  FlashOn as Tier1Icon,
  Person as Tier2Icon,
  Extension as Tier3Icon,
  InfoOutlined,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import {
  PageHeader,
  FormCard,
  FormSectionHeader,
  FormActions,
} from "@/components/shared-ui/FormElements";

interface CustomQuestion {
  id: string;
  label: string;
  type: "text" | "select" | "multiselect" | "checkbox";
  options: string[];
  required: boolean;
  placeholder: string;
}

interface FormConfig {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isBuiltIn: boolean;
  tier1: {
    showExperienceLevel: boolean;
    customQuestions: CustomQuestion[];
  };
  tier2: {
    enabled: boolean;
    prompt: string;
    showSkills: boolean;
    showGithub: boolean;
    showBio: boolean;
    customQuestions: CustomQuestion[];
  };
  tier3: {
    enabled: boolean;
    prompt: string;
    customQuestions: CustomQuestion[];
  };
}

function generateId() {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/* ─── Question Editor Component ─── */
function QuestionEditor({
  question,
  onChange,
  onDelete,
}: {
  question: CustomQuestion;
  onChange: (updated: CustomQuestion) => void;
  onDelete: () => void;
}) {
  const [newOption, setNewOption] = useState("");

  const needsOptions =
    question.type === "select" || question.type === "multiselect";

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ pb: "16px !important" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <DragIcon sx={{ color: "text.secondary", cursor: "grab" }} />
          <Typography variant="subtitle2" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Custom Question
          </Typography>
          <IconButton size="small" color="error" onClick={onDelete}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              size="small"
              label="Question Label"
              value={question.label}
              onChange={(e) =>
                onChange({ ...question, label: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              select
              label="Type"
              value={question.type}
              onChange={(e) =>
                onChange({
                  ...question,
                  type: e.target.value as CustomQuestion["type"],
                })
              }
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="select">Select (single)</MenuItem>
              <MenuItem value="multiselect">Multi-select</MenuItem>
              <MenuItem value="checkbox">Checkbox</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              size="small"
              label="Placeholder"
              value={question.placeholder}
              onChange={(e) =>
                onChange({ ...question, placeholder: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={question.required}
                  onChange={(e) =>
                    onChange({ ...question, required: e.target.checked })
                  }
                  size="small"
                />
              }
              label="Required"
            />
          </Grid>

          {needsOptions && (
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1, display: "block" }}
              >
                Options
              </Typography>
              <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5, mb: 1 }}>
                {question.options.map((opt, i) => (
                  <Chip
                    key={i}
                    label={opt}
                    size="small"
                    onDelete={() =>
                      onChange({
                        ...question,
                        options: question.options.filter((_, j) => j !== i),
                      })
                    }
                  />
                ))}
              </Stack>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Add option..."
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newOption.trim()) {
                      e.preventDefault();
                      onChange({
                        ...question,
                        options: [...question.options, newOption.trim()],
                      });
                      setNewOption("");
                    }
                  }}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    if (newOption.trim()) {
                      onChange({
                        ...question,
                        options: [...question.options, newOption.trim()],
                      });
                      setNewOption("");
                    }
                  }}
                >
                  Add
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}

/* ─── Questions List Component ─── */
function QuestionsList({
  questions,
  onChange,
  maxQuestions,
}: {
  questions: CustomQuestion[];
  onChange: (questions: CustomQuestion[]) => void;
  maxQuestions?: number;
}) {
  const addQuestion = () => {
    if (maxQuestions && questions.length >= maxQuestions) return;
    onChange([
      ...questions,
      {
        id: generateId(),
        label: "",
        type: "text",
        options: [],
        required: false,
        placeholder: "",
      },
    ]);
  };

  return (
    <Box>
      {questions.map((q, i) => (
        <QuestionEditor
          key={q.id}
          question={q}
          onChange={(updated) => {
            const next = [...questions];
            next[i] = updated;
            onChange(next);
          }}
          onDelete={() => onChange(questions.filter((_, j) => j !== i))}
        />
      ))}
      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={addQuestion}
        disabled={maxQuestions ? questions.length >= maxQuestions : false}
      >
        Add Question
        {maxQuestions ? ` (${questions.length}/${maxQuestions})` : ""}
      </Button>
    </Box>
  );
}

/* ─── Main Editor Page ─── */
export default function RegistrationFormEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [formId, setFormId] = useState("");
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    params.then((p) => {
      setFormId(p.id);
      fetchForm(p.id);
    });
  }, [params]);

  const fetchForm = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/registration-forms/${id}`);
      const data = await res.json();
      if (data.success) {
        setConfig(data.form);
      } else {
        setSnackbar({
          open: true,
          message: "Form not found",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to load form",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/registration-forms/${formId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: config.name,
          description: config.description,
          tier1: config.tier1,
          tier2: config.tier2,
          tier3: config.tier3,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({
          open: true,
          message: "Form saved successfully",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: data.error || "Failed to save",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to save form",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!config) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">Registration form not found.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Top Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={() => router.push("/admin/settings/registration-forms")}
          >
            <BackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {config.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {config.slug}
              {config.isBuiltIn && " (built-in)"}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving || config.isBuiltIn}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </Box>

      {config.isBuiltIn && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Built-in forms cannot be edited. Clone this form to create a
          customizable copy.
        </Alert>
      )}

      {/* Basic Info */}
      <FormCard>
        <FormSectionHeader
          icon={<InfoOutlined />}
          title="Basic Information"
          subtitle="Form name and description"
        />
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Form Name"
              value={config.name}
              onChange={(e) =>
                setConfig({ ...config, name: e.target.value })
              }
              disabled={config.isBuiltIn}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Slug"
              value={config.slug}
              disabled
              helperText="Cannot be changed after creation"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Description"
              value={config.description}
              onChange={(e) =>
                setConfig({ ...config, description: e.target.value })
              }
              disabled={config.isBuiltIn}
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </FormCard>

      {/* Tier 1 — Quick Registration */}
      <FormCard>
        <FormSectionHeader
          icon={<Tier1Icon />}
          title="Tier 1 — Quick Registration"
          subtitle="Basic info collected during initial sign-up (always active)"
        />

        <FormControlLabel
          control={
            <Switch
              checked={config.tier1.showExperienceLevel}
              onChange={(e) =>
                setConfig({
                  ...config,
                  tier1: {
                    ...config.tier1,
                    showExperienceLevel: e.target.checked,
                  },
                })
              }
              disabled={config.isBuiltIn}
            />
          }
          label="Show Experience Level"
          sx={{ mb: 2, display: "block" }}
        />

        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          Custom Questions (max 2)
        </Typography>
        <QuestionsList
          questions={config.tier1.customQuestions}
          onChange={(customQuestions) =>
            setConfig({
              ...config,
              tier1: { ...config.tier1, customQuestions },
            })
          }
          maxQuestions={2}
        />
      </FormCard>

      {/* Tier 2 — Profile Enhancement */}
      <FormCard>
        <FormSectionHeader
          icon={<Tier2Icon />}
          title="Tier 2 — Profile Enhancement"
          subtitle="Additional profile fields shown after quick registration"
        />

        <FormControlLabel
          control={
            <Switch
              checked={config.tier2.enabled}
              onChange={(e) =>
                setConfig({
                  ...config,
                  tier2: { ...config.tier2, enabled: e.target.checked },
                })
              }
              disabled={config.isBuiltIn}
            />
          }
          label="Enable Tier 2"
          sx={{ mb: 2, display: "block" }}
        />

        {config.tier2.enabled && (
          <>
            <TextField
              fullWidth
              size="small"
              label="Prompt Message"
              value={config.tier2.prompt}
              onChange={(e) =>
                setConfig({
                  ...config,
                  tier2: { ...config.tier2, prompt: e.target.value },
                })
              }
              disabled={config.isBuiltIn}
              helperText="Message shown to users at the start of this step"
              sx={{ mb: 2 }}
            />

            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, mb: 1 }}
            >
              Standard Fields
            </Typography>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.tier2.showSkills}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        tier2: {
                          ...config.tier2,
                          showSkills: e.target.checked,
                        },
                      })
                    }
                    disabled={config.isBuiltIn}
                    size="small"
                  />
                }
                label="Skills"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.tier2.showGithub}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        tier2: {
                          ...config.tier2,
                          showGithub: e.target.checked,
                        },
                      })
                    }
                    disabled={config.isBuiltIn}
                    size="small"
                  />
                }
                label="GitHub Username"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.tier2.showBio}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        tier2: {
                          ...config.tier2,
                          showBio: e.target.checked,
                        },
                      })
                    }
                    disabled={config.isBuiltIn}
                    size="small"
                  />
                }
                label="Bio"
              />
            </Box>

            <Divider sx={{ mb: 2 }} />
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, mb: 1.5 }}
            >
              Custom Questions
            </Typography>
            <QuestionsList
              questions={config.tier2.customQuestions}
              onChange={(customQuestions) =>
                setConfig({
                  ...config,
                  tier2: { ...config.tier2, customQuestions },
                })
              }
            />
          </>
        )}
      </FormCard>

      {/* Tier 3 — Additional Questions */}
      <FormCard>
        <FormSectionHeader
          icon={<Tier3Icon />}
          title="Tier 3 — Additional Questions"
          subtitle="Extra questions from event organizers"
        />

        <FormControlLabel
          control={
            <Switch
              checked={config.tier3.enabled}
              onChange={(e) =>
                setConfig({
                  ...config,
                  tier3: { ...config.tier3, enabled: e.target.checked },
                })
              }
              disabled={config.isBuiltIn}
            />
          }
          label="Enable Tier 3"
          sx={{ mb: 2, display: "block" }}
        />

        {config.tier3.enabled && (
          <>
            <TextField
              fullWidth
              size="small"
              label="Prompt Message"
              value={config.tier3.prompt}
              onChange={(e) =>
                setConfig({
                  ...config,
                  tier3: { ...config.tier3, prompt: e.target.value },
                })
              }
              disabled={config.isBuiltIn}
              helperText="Message shown to users at the start of this step"
              sx={{ mb: 2 }}
            />

            <Divider sx={{ mb: 2 }} />
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, mb: 1.5 }}
            >
              Custom Questions
            </Typography>
            <QuestionsList
              questions={config.tier3.customQuestions}
              onChange={(customQuestions) =>
                setConfig({
                  ...config,
                  tier3: { ...config.tier3, customQuestions },
                })
              }
            />
          </>
        )}
      </FormCard>

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
