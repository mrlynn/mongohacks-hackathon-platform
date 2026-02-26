"use client";

import { useState, useEffect, useRef } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { VerifiedUserOutlined } from "@mui/icons-material";
import {
  AuthPageWrapper,
  AuthCard,
  AuthBranding,
} from "@/components/shared-ui/FormElements";

export default function TwoFactorPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("2fa_email");
    if (!stored) {
      window.location.href = "/login";
      return;
    }
    setEmail(stored);
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || code.length !== 6) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Invalid code");
        setLoading(false);
        return;
      }

      // Use the callback token to complete sign-in via magic-link provider
      const { signIn } = await import("next-auth/react");
      const result = await signIn("magic-link", {
        token: data.callbackToken,
        email,
        redirect: false,
      });

      if (result?.error) {
        setError("Sign-in failed. Please try again.");
        setLoading(false);
      } else {
        sessionStorage.removeItem("2fa_email");
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email) return;
    setResending(true);
    setError("");

    try {
      // Re-trigger the login to generate a new code
      const { signIn } = await import("next-auth/react");
      // We can't re-send without the password, so direct them back to login
      setError("Please go back to the login page and sign in again to receive a new code.");
    } catch {
      setError("Failed to resend code.");
    } finally {
      setResending(false);
    }
  }

  if (!email) {
    return (
      <AuthPageWrapper>
        <AuthBranding />
        <AuthCard>
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        </AuthCard>
      </AuthPageWrapper>
    );
  }

  return (
    <AuthPageWrapper>
      <AuthBranding />
      <AuthCard>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <VerifiedUserOutlined
            sx={{ fontSize: 48, color: "primary.main", mb: 1 }}
          />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Verification Code
          </Typography>
          <Typography color="text.secondary">
            Enter the 6-digit code sent to your email
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="6-digit code"
            value={code}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(val);
            }}
            inputRef={inputRef}
            placeholder="000000"
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                sx: {
                  textAlign: "center",
                  fontSize: "1.5rem",
                  letterSpacing: "0.3em",
                  fontWeight: 600,
                },
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || code.length !== 6}
            sx={{ mb: 2, py: 1.5 }}
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="text"
              size="small"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Resending..." : "Didn't receive a code?"}
            </Button>
            <br />
            <Button
              variant="text"
              size="small"
              href="/login"
              sx={{ mt: 1 }}
            >
              Back to login
            </Button>
          </Box>
        </Box>
      </AuthCard>
    </AuthPageWrapper>
  );
}
