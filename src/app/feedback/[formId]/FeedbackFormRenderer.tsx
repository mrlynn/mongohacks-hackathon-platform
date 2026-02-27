"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  FormGroup,
  Checkbox,
  Rating,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
} from "@mui/material";

interface ScaleConfig {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
}

interface FeedbackQuestion {
  id: string;
  type: string;
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

interface FeedbackForm {
  _id: string;
  name: string;
  targetAudience: string;
  sections: FeedbackSection[];
}

function LinearScaleInput({
  question,
  value,
  onChange,
}: {
  question: FeedbackQuestion;
  value: number | "";
  onChange: (val: number) => void;
}) {
  const config = question.scaleConfig || { min: 1, max: 5, minLabel: "", maxLabel: "" };
  const options = [];
  for (let i = config.min; i <= config.max; i++) {
    options.push(i);
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          justifyContent: "center",
          mt: 1,
        }}
      >
        {config.minLabel && (
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1.5 }}>
            {config.minLabel}
          </Typography>
        )}
        {options.map((num) => (
          <Button
            key={num}
            variant={value === num ? "contained" : "outlined"}
            size="small"
            onClick={() => onChange(num)}
            sx={{
              minWidth: 40,
              height: 40,
              borderRadius: "50%",
              mx: 0.25,
            }}
          >
            {num}
          </Button>
        ))}
        {config.maxLabel && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1.5 }}>
            {config.maxLabel}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function FeedbackFormRenderer({
  form,
  eventId,
}: {
  form: FeedbackForm;
  eventId: string;
}) {
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [respondentEmail, setRespondentEmail] = useState("");
  const [respondentName, setRespondentName] = useState("");
  const [respondentType, setRespondentType] = useState<"participant" | "partner">(
    form.targetAudience === "partner" ? "partner" : "participant"
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const setAnswer = (qId: string, value: string | number | string[]) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const toggleCheckbox = (qId: string, option: string) => {
    setAnswers((prev) => {
      const current = (prev[qId] as string[]) || [];
      if (current.includes(option)) {
        return { ...prev, [qId]: current.filter((o) => o !== option) };
      }
      return { ...prev, [qId]: [...current, option] };
    });
  };

  const handleSubmit = async () => {
    if (!respondentEmail || !respondentName) {
      setError("Please provide your name and email.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/feedback/${form._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          respondentEmail,
          respondentName,
          respondentType,
          answers,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || "Failed to submit feedback");
      }
    } catch {
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card elevation={3} sx={{ textAlign: "center", py: 6 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Thank you for your feedback!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your response has been recorded. We appreciate you taking the
            time to share your thoughts.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Respondent Info */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Your Information
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={respondentName}
              onChange={(e) => setRespondentName(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={respondentEmail}
              onChange={(e) => setRespondentEmail(e.target.value)}
              required
            />
            {form.targetAudience === "both" && (
              <FormControl fullWidth>
                <InputLabel>I am a...</InputLabel>
                <Select
                  value={respondentType}
                  label="I am a..."
                  onChange={(e) =>
                    setRespondentType(e.target.value as "participant" | "partner")
                  }
                >
                  <MenuItem value="participant">Participant</MenuItem>
                  <MenuItem value="partner">Partner</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Sections */}
      {form.sections.map((section) => (
        <Card elevation={2} sx={{ mb: 3 }} key={section.id}>
          <CardContent>
            {section.title && (
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {section.title}
              </Typography>
            )}
            {section.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                {section.description}
              </Typography>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {section.questions.map((question) => (
                <Box key={question.id}>
                  <FormControl fullWidth>
                    <FormLabel
                      sx={{ fontWeight: 500, mb: 0.5, color: "text.primary" }}
                    >
                      {question.label}
                      {question.required && (
                        <Typography
                          component="span"
                          color="error"
                          sx={{ ml: 0.5 }}
                        >
                          *
                        </Typography>
                      )}
                    </FormLabel>
                    {question.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mb: 1, display: "block" }}
                      >
                        {question.description}
                      </Typography>
                    )}

                    {question.type === "short_text" && (
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={question.placeholder}
                        value={(answers[question.id] as string) || ""}
                        onChange={(e) =>
                          setAnswer(question.id, e.target.value)
                        }
                      />
                    )}

                    {question.type === "long_text" && (
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder={question.placeholder}
                        value={(answers[question.id] as string) || ""}
                        onChange={(e) =>
                          setAnswer(question.id, e.target.value)
                        }
                      />
                    )}

                    {question.type === "multiple_choice" && (
                      <RadioGroup
                        value={(answers[question.id] as string) || ""}
                        onChange={(e) =>
                          setAnswer(question.id, e.target.value)
                        }
                      >
                        {question.options.map((opt) => (
                          <FormControlLabel
                            key={opt}
                            value={opt}
                            control={<Radio size="small" />}
                            label={opt}
                          />
                        ))}
                      </RadioGroup>
                    )}

                    {question.type === "checkbox" && (
                      <FormGroup>
                        {question.options.map((opt) => (
                          <FormControlLabel
                            key={opt}
                            control={
                              <Checkbox
                                size="small"
                                checked={(
                                  (answers[question.id] as string[]) || []
                                ).includes(opt)}
                                onChange={() =>
                                  toggleCheckbox(question.id, opt)
                                }
                              />
                            }
                            label={opt}
                          />
                        ))}
                      </FormGroup>
                    )}

                    {question.type === "linear_scale" && (
                      <LinearScaleInput
                        question={question}
                        value={
                          (answers[question.id] as number) || ""
                        }
                        onChange={(val) => setAnswer(question.id, val)}
                      />
                    )}

                    {question.type === "rating" && (
                      <Rating
                        value={(answers[question.id] as number) || 0}
                        max={question.scaleConfig?.max || 5}
                        onChange={(_, val) => {
                          if (val !== null)
                            setAnswer(question.id, val);
                        }}
                        size="large"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </FormControl>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* Submit Button */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{ minWidth: 200, fontWeight: 600 }}
        >
          {submitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Submit Feedback"
          )}
        </Button>
      </Box>
    </Box>
  );
}
