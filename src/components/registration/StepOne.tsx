"use client";

import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import OAuthButtons from "./OAuthButtons";

interface StepOneProps {
  email: string;
  onEmailChange: (email: string) => void;
  password: string;
  onPasswordChange: (password: string) => void;
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  isLoggedIn: boolean;
  eventId?: string;
  error?: string;
}

export default function StepOne({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  termsAccepted,
  onTermsChange,
  isLoggedIn,
  eventId,
  error,
}: StepOneProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const validateEmail = useCallback((value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError("");
      return;
    }
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    // Valid format
    setEmailError("");
  }, []);

  // Debounced email validation
  useEffect(() => {
    if (!email || isLoggedIn) return;

    const timer = setTimeout(() => {
      validateEmail(email);
    }, 300);

    return () => clearTimeout(timer);
  }, [email, isLoggedIn, validateEmail]);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        Create Your Account
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {isLoggedIn
          ? "Complete your registration to join this event"
          : "Quick account creation — just email and password to get started"}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!isLoggedIn && <OAuthButtons eventId={eventId} />}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <TextField
          fullWidth
          required
          type="email"
          label="Email Address"
          value={email}
          onChange={(e) => {
            onEmailChange(e.target.value);
          }}
          error={!!emailError}
          helperText={
            isCheckingEmail
              ? "Checking email..."
              : emailError || "We'll send your confirmation here"
          }
          disabled={isLoggedIn}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon />
              </InputAdornment>
            ),
          }}
        />

        {!isLoggedIn && (
          <Box>
            <TextField
              fullWidth
              required
              type={showPassword ? "text" : "password"}
              label="Password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              helperText="Minimum 8 characters"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <PasswordStrengthMeter password={password} />
          </Box>
        )}

        <FormControlLabel
          control={
            <Checkbox
              checked={termsAccepted}
              onChange={(e) => onTermsChange(e.target.checked)}
              required
            />
          }
          label={
            <Typography variant="body2">
              I agree to the{" "}
              <Link href="/terms" target="_blank">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank">
                Privacy Policy
              </Link>
            </Typography>
          }
        />

        {!isLoggedIn && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Already have an account?{" "}
            <Link href="/login" sx={{ fontWeight: 600 }}>
              Sign in instead
            </Link>
          </Typography>
        )}
      </Box>
    </Box>
  );
}
