"use client";

import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Chip,
} from "@mui/material";

export interface CustomQuestion {
  id: string;
  label: string;
  type: "text" | "select" | "multiselect" | "checkbox";
  options: string[];
  required: boolean;
  placeholder: string;
}

interface CustomQuestionRendererProps {
  question: CustomQuestion;
  value: unknown;
  onChange: (value: unknown) => void;
}

export default function CustomQuestionRenderer({
  question,
  value,
  onChange,
}: CustomQuestionRendererProps) {
  switch (question.type) {
    case "text":
      return (
        <TextField
          fullWidth
          label={question.label}
          placeholder={question.placeholder}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
        />
      );

    case "select":
      return (
        <FormControl fullWidth required={question.required}>
          <InputLabel>{question.label}</InputLabel>
          <Select
            value={(value as string) || ""}
            label={question.label}
            onChange={(e) => onChange(e.target.value)}
          >
            {question.options.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );

    case "multiselect":
      return (
        <Autocomplete
          multiple
          options={question.options}
          value={(value as string[]) || []}
          onChange={(_, newValue) => onChange(newValue)}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip
                  key={key}
                  label={option}
                  size="small"
                  {...tagProps}
                />
              );
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label={question.label}
              placeholder={question.placeholder}
              required={question.required && (!value || (value as string[]).length === 0)}
            />
          )}
        />
      );

    case "checkbox":
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              required={question.required}
            />
          }
          label={question.label}
        />
      );

    default:
      return null;
  }
}
