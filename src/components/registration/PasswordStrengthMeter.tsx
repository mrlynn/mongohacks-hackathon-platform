"use client";

import { Box, LinearProgress, Typography } from "@mui/material";
import { useMemo } from "react";

interface PasswordStrengthMeterProps {
  password: string;
}

interface StrengthResult {
  score: number; // 0-100
  label: string;
  color: "error" | "warning" | "success";
  feedback: string[];
}

function calculatePasswordStrength(password: string): StrengthResult {
  if (!password) {
    return {
      score: 0,
      label: "No password",
      color: "error",
      feedback: [],
    };
  }

  let score = 0;
  const feedback: string[] = [];

  // Length check (0-40 points)
  if (password.length >= 8) {
    score += 20;
  } else {
    feedback.push("At least 8 characters");
  }

  if (password.length >= 12) {
    score += 10;
  }

  if (password.length >= 16) {
    score += 10;
  }

  // Character variety (0-40 points)
  if (/[a-z]/.test(password)) {
    score += 10;
  } else {
    feedback.push("Include lowercase letters");
  }

  if (/[A-Z]/.test(password)) {
    score += 10;
  } else {
    feedback.push("Include uppercase letters");
  }

  if (/[0-9]/.test(password)) {
    score += 10;
  } else {
    feedback.push("Include numbers");
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 10;
  } else {
    feedback.push("Include special characters (!@#$%^&*)");
  }

  // Complexity bonus (0-20 points)
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= 8) {
    score += 10;
  }

  // No common patterns
  const commonPatterns = [
    "123456",
    "password",
    "qwerty",
    "abc123",
    "111111",
    "admin",
  ];
  const lowerPassword = password.toLowerCase();
  const hasCommonPattern = commonPatterns.some((pattern) =>
    lowerPassword.includes(pattern)
  );

  if (!hasCommonPattern) {
    score += 10;
  } else {
    feedback.push("Avoid common patterns");
    score = Math.max(0, score - 20);
  }

  // Determine label and color
  let label: string;
  let color: "error" | "warning" | "success";

  if (score < 40) {
    label = "Weak";
    color = "error";
  } else if (score < 70) {
    label = "Medium";
    color = "warning";
  } else {
    label = "Strong";
    color = "success";
  }

  return { score, label, color, feedback };
}

export default function PasswordStrengthMeter({
  password,
}: PasswordStrengthMeterProps) {
  const strength = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  );

  if (!password) return null;

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <LinearProgress
          variant="determinate"
          value={strength.score}
          color={strength.color}
          sx={{ flex: 1, height: 6, borderRadius: 3 }}
        />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color:
              strength.color === "error"
                ? "error.main"
                : strength.color === "warning"
                ? "warning.main"
                : "success.main",
            minWidth: 60,
          }}
        >
          {strength.label}
        </Typography>
      </Box>

      {strength.feedback.length > 0 && (
        <Box sx={{ mt: 0.5 }}>
          {strength.feedback.map((tip, index) => (
            <Typography
              key={index}
              variant="caption"
              sx={{ display: "block", color: "text.secondary", fontSize: 11 }}
            >
              • {tip}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}
