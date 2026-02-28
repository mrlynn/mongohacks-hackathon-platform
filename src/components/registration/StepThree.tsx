"use client";

import {
  Box,
  TextField,
  Typography,
  MenuItem,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Grid,
  Chip,
} from "@mui/material";

interface CustomQuestion {
  id: string;
  label: string;
  type: "text" | "select" | "multiselect" | "checkbox";
  options: string[];
  required: boolean;
  placeholder: string;
}

interface StepThreeProps {
  customQuestions: CustomQuestion[];
  customAnswers: Record<string, unknown>;
  onCustomAnswerChange: (questionId: string, value: unknown) => void;
}

export default function StepThree({
  customQuestions,
  customAnswers,
  onCustomAnswerChange,
}: StepThreeProps) {
  const renderCustomQuestion = (question: CustomQuestion) => {
    const value = customAnswers[question.id];

    switch (question.type) {
      case "text":
        return (
          <Grid size={{ xs: 12 }} key={question.id}>
            <TextField
              fullWidth
              required={question.required}
              label={question.label}
              placeholder={question.placeholder}
              value={(value as string) || ""}
              onChange={(e) => onCustomAnswerChange(question.id, e.target.value)}
            />
          </Grid>
        );

      case "select":
        return (
          <Grid size={{ xs: 12 }} key={question.id}>
            <TextField
              fullWidth
              select
              required={question.required}
              label={question.label}
              value={(value as string) || ""}
              onChange={(e) => onCustomAnswerChange(question.id, e.target.value)}
            >
              {question.options.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        );

      case "multiselect":
        return (
          <Grid size={{ xs: 12 }} key={question.id}>
            <Autocomplete
              multiple
              options={question.options}
              value={(value as string[]) || []}
              onChange={(_, newValue) => onCustomAnswerChange(question.id, newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={question.label}
                  required={question.required}
                  placeholder={question.placeholder}
                />
              )}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                  <Chip
                    label={option}
                    size="small"
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
            />
          </Grid>
        );

      case "checkbox":
        return (
          <Grid size={{ xs: 12 }} key={question.id}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={(value as boolean) || false}
                  onChange={(e) => onCustomAnswerChange(question.id, e.target.checked)}
                  required={question.required}
                />
              }
              label={question.label}
            />
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        {customQuestions.length > 0 ? "Final Details" : "Almost Done!"}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {customQuestions.length > 0
          ? "Just a few more questions and you're all set"
          : "Click Complete Registration to finish"}
      </Typography>

      {customQuestions.length > 0 ? (
        <Grid container spacing={3}>
          {customQuestions.map(renderCustomQuestion)}
        </Grid>
      ) : (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No additional information needed. You're ready to go!
          </Typography>
        </Box>
      )}
    </Box>
  );
}
