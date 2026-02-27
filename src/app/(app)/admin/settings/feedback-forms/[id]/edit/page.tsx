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
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  InfoOutlined,
  ViewList as SectionIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import {
  FormCard,
  FormSectionHeader,
} from "@/components/shared-ui/FormElements";

interface ScaleConfig {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
}

interface FeedbackQuestion {
  id: string;
  type:
    | "short_text"
    | "long_text"
    | "multiple_choice"
    | "checkbox"
    | "linear_scale"
    | "rating";
  label: string;
  description: string;
  required: boolean;
  placeholder: string;
  options: string[];
  scaleConfig?: ScaleConfig;
}

interface FeedbackSection {
  id: string;
  title: string;
  description: string;
  questions: FeedbackQuestion[];
}

interface FeedbackFormConfig {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isBuiltIn: boolean;
  targetAudience: "participant" | "partner" | "both";
  sections: FeedbackSection[];
}

function generateId(prefix: string = "q") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

const QUESTION_TYPES: { value: FeedbackQuestion["type"]; label: string }[] = [
  { value: "short_text", label: "Short Text" },
  { value: "long_text", label: "Long Text" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "checkbox", label: "Checkboxes" },
  { value: "linear_scale", label: "Linear Scale" },
  { value: "rating", label: "Star Rating" },
];

/* ─── Question Editor Component ─── */
function FeedbackQuestionEditor({
  question,
  onChange,
  onDelete,
  disabled,
}: {
  question: FeedbackQuestion;
  onChange: (updated: FeedbackQuestion) => void;
  onDelete: () => void;
  disabled: boolean;
}) {
  const [newOption, setNewOption] = useState("");

  const needsOptions =
    question.type === "multiple_choice" || question.type === "checkbox";
  const needsScale =
    question.type === "linear_scale" || question.type === "rating";

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
          <Typography
            variant="subtitle2"
            sx={{ flexGrow: 1, fontWeight: 600 }}
          >
            Question
          </Typography>
          <IconButton
            size="small"
            color="error"
            onClick={onDelete}
            disabled={disabled}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              label="Question Label"
              value={question.label}
              onChange={(e) =>
                onChange({ ...question, label: e.target.value })
              }
              disabled={disabled}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              select
              label="Type"
              value={question.type}
              onChange={(e) => {
                const type = e.target.value as FeedbackQuestion["type"];
                const updated: FeedbackQuestion = { ...question, type };
                if (
                  (type === "linear_scale" || type === "rating") &&
                  !updated.scaleConfig
                ) {
                  updated.scaleConfig = {
                    min: 1,
                    max: type === "rating" ? 5 : 10,
                    minLabel: "",
                    maxLabel: "",
                  };
                }
                onChange(updated);
              }}
              disabled={disabled}
            >
              {QUESTION_TYPES.map((qt) => (
                <MenuItem key={qt.value} value={qt.value}>
                  {qt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={question.required}
                  onChange={(e) =>
                    onChange({ ...question, required: e.target.checked })
                  }
                  size="small"
                  disabled={disabled}
                />
              }
              label="Required"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              label="Description (optional)"
              value={question.description}
              onChange={(e) =>
                onChange({ ...question, description: e.target.value })
              }
              disabled={disabled}
            />
          </Grid>
          {(question.type === "short_text" ||
            question.type === "long_text") && (
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Placeholder"
                value={question.placeholder}
                onChange={(e) =>
                  onChange({ ...question, placeholder: e.target.value })
                }
                disabled={disabled}
              />
            </Grid>
          )}

          {needsOptions && (
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1, display: "block" }}
              >
                Options
              </Typography>
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ flexWrap: "wrap", gap: 0.5, mb: 1 }}
              >
                {question.options.map((opt, i) => (
                  <Chip
                    key={i}
                    label={opt}
                    size="small"
                    onDelete={
                      disabled
                        ? undefined
                        : () =>
                            onChange({
                              ...question,
                              options: question.options.filter(
                                (_, j) => j !== i
                              ),
                            })
                    }
                  />
                ))}
              </Stack>
              {!disabled && (
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
              )}
            </Grid>
          )}

          {needsScale && question.scaleConfig && (
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1, display: "block" }}
              >
                Scale Configuration
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Min"
                    value={question.scaleConfig.min}
                    onChange={(e) =>
                      onChange({
                        ...question,
                        scaleConfig: {
                          ...question.scaleConfig!,
                          min: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    disabled={disabled}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Max"
                    value={question.scaleConfig.max}
                    onChange={(e) =>
                      onChange({
                        ...question,
                        scaleConfig: {
                          ...question.scaleConfig!,
                          max: parseInt(e.target.value) || 1,
                        },
                      })
                    }
                    disabled={disabled}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Min Label"
                    value={question.scaleConfig.minLabel}
                    onChange={(e) =>
                      onChange({
                        ...question,
                        scaleConfig: {
                          ...question.scaleConfig!,
                          minLabel: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Poor"
                    disabled={disabled}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Max Label"
                    value={question.scaleConfig.maxLabel}
                    onChange={(e) =>
                      onChange({
                        ...question,
                        scaleConfig: {
                          ...question.scaleConfig!,
                          maxLabel: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Excellent"
                    disabled={disabled}
                  />
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}

/* ─── Section Editor Component ─── */
function SectionEditor({
  section,
  sectionIndex,
  onChange,
  onDelete,
  disabled,
  canDelete,
}: {
  section: FeedbackSection;
  sectionIndex: number;
  onChange: (updated: FeedbackSection) => void;
  onDelete: () => void;
  disabled: boolean;
  canDelete: boolean;
}) {
  const addQuestion = () => {
    onChange({
      ...section,
      questions: [
        ...section.questions,
        {
          id: generateId("q"),
          type: "short_text",
          label: "",
          description: "",
          required: false,
          placeholder: "",
          options: [],
        },
      ],
    });
  };

  return (
    <FormCard>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <FormSectionHeader
          icon={<SectionIcon />}
          title={`Section ${sectionIndex + 1}`}
          subtitle={section.title || "Untitled section"}
        />
        {canDelete && !disabled && (
          <IconButton color="error" onClick={onDelete} size="small">
            <DeleteIcon />
          </IconButton>
        )}
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Section Title"
            value={section.title}
            onChange={(e) =>
              onChange({ ...section, title: e.target.value })
            }
            disabled={disabled}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Section Description (optional)"
            value={section.description}
            onChange={(e) =>
              onChange({ ...section, description: e.target.value })
            }
            disabled={disabled}
          />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
        Questions ({section.questions.length})
      </Typography>

      {section.questions.map((q, qi) => (
        <FeedbackQuestionEditor
          key={q.id}
          question={q}
          onChange={(updated) => {
            const next = [...section.questions];
            next[qi] = updated;
            onChange({ ...section, questions: next });
          }}
          onDelete={() =>
            onChange({
              ...section,
              questions: section.questions.filter((_, j) => j !== qi),
            })
          }
          disabled={disabled}
        />
      ))}

      {!disabled && (
        <Button size="small" startIcon={<AddIcon />} onClick={addQuestion}>
          Add Question
        </Button>
      )}
    </FormCard>
  );
}

/* ─── Main Editor Page ─── */
export default function FeedbackFormEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [formId, setFormId] = useState("");
  const [config, setConfig] = useState<FeedbackFormConfig | null>(null);
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
      const res = await fetch(`/api/admin/feedback-forms/${id}`);
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
      const res = await fetch(`/api/admin/feedback-forms/${formId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: config.name,
          description: config.description,
          targetAudience: config.targetAudience,
          sections: config.sections,
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

  const addSection = () => {
    if (!config) return;
    setConfig({
      ...config,
      sections: [
        ...config.sections,
        {
          id: generateId("sec"),
          title: "",
          description: "",
          questions: [
            {
              id: generateId("q"),
              type: "short_text",
              label: "",
              description: "",
              required: false,
              placeholder: "",
              options: [],
            },
          ],
        },
      ],
    });
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
        <Alert severity="error">Feedback form not found.</Alert>
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
            onClick={() => router.push("/admin/settings/feedback-forms")}
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
          subtitle="Form name, description, and target audience"
        />
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 4 }}>
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
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Slug"
              value={config.slug}
              disabled
              helperText="Cannot be changed after creation"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Target Audience</InputLabel>
              <Select
                value={config.targetAudience}
                label="Target Audience"
                onChange={(e) =>
                  setConfig({
                    ...config,
                    targetAudience: e.target.value as FeedbackFormConfig["targetAudience"],
                  })
                }
                disabled={config.isBuiltIn}
              >
                <MenuItem value="participant">Participants</MenuItem>
                <MenuItem value="partner">Partners</MenuItem>
                <MenuItem value="both">Both</MenuItem>
              </Select>
            </FormControl>
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

      {/* Sections */}
      {config.sections.map((section, si) => (
        <SectionEditor
          key={section.id}
          section={section}
          sectionIndex={si}
          onChange={(updated) => {
            const next = [...config.sections];
            next[si] = updated;
            setConfig({ ...config, sections: next });
          }}
          onDelete={() =>
            setConfig({
              ...config,
              sections: config.sections.filter((_, j) => j !== si),
            })
          }
          disabled={config.isBuiltIn}
          canDelete={config.sections.length > 1}
        />
      ))}

      {/* Add Section Button */}
      {!config.isBuiltIn && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addSection}
          >
            Add Section
          </Button>
        </Box>
      )}

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
