"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  InputAdornment,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  EmailOutlined,
  LockOutlined,
  LinkOutlined,
} from "@mui/icons-material";
import Link from "next/link";
import {
  AuthPageWrapper,
  AuthCard,
  AuthBranding,
} from "@/components/shared-ui/FormElements";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const mode = searchParams.get("mode");
  const callbackToken = searchParams.get("callbackToken");
  const callbackEmail = searchParams.get("email");
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginMode, setLoginMode] = useState<"password" | "magic-link">("password");
  const [loading, setLoading] = useState(false);
  const [processingCallback, setProcessingCallback] = useState(false);

  // Handle magic link callback
  const handleMagicCallback = useCallback(async () => {
    if (mode !== "magic-callback" || !callbackToken || !callbackEmail) return;
    setProcessingCallback(true);
    try {
      const { signIn } = await import("next-auth/react");
      const result = await signIn("magic-link", {
        token: callbackToken,
        email: callbackEmail,
        redirect: false,
      });

      if (result?.error) {
        setError("Magic link has expired or is invalid. Please request a new one.");
        setProcessingCallback(false);
      } else {
        window.location.href = redirectTo || "/dashboard";
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setProcessingCallback(false);
    }
  }, [mode, callbackToken, callbackEmail, redirectTo]);

  useEffect(() => {
    handleMagicCallback();
  }, [handleMagicCallback]);

  useEffect(() => {
    if (errorParam === "InvalidOrExpiredLink") {
      setError("This magic link has expired or is invalid. Please request a new one.");
      setLoginMode("magic-link");
    }
  }, [errorParam]);

  // Password login
  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { signIn } = await import("next-auth/react");
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Check if 2FA is required
        const statusRes = await fetch("/api/auth/2fa/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const statusData = await statusRes.json();

        if (statusData.requiresTwoFactor) {
          sessionStorage.setItem("2fa_email", email);
          window.location.href = "/two-factor";
          return;
        }

        setError("Invalid email or password");
      } else {
        window.location.href = redirectTo || "/dashboard";
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Magic link request
  async function handleMagicLinkSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess("Check your email for a sign-in link. It expires in 15 minutes.");
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Show loading spinner during magic link callback processing
  if (processingCallback) {
    return (
      <AuthPageWrapper>
        <AuthBranding />
        <AuthCard>
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography color="text.secondary">
              Signing you in...
            </Typography>
          </Box>
        </AuthCard>
      </AuthPageWrapper>
    );
  }

  return (
    <AuthPageWrapper>
      <AuthBranding />
      <AuthCard>
        <Typography
          variant="h4"
          fontWeight={700}
          textAlign="center"
          gutterBottom
        >
          Welcome Back
        </Typography>
        <Typography
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          {loginMode === "password"
            ? "Sign in to your hackathon account"
            : "Get a sign-in link sent to your email"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {loginMode === "password" ? (
          <Box component="form" onSubmit={handlePasswordSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2.5 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3.5 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mb: 2, py: 1.5 }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<LinkOutlined />}
              onClick={() => {
                setLoginMode("magic-link");
                setError("");
                setSuccess("");
              }}
              sx={{ mb: 3 }}
            >
              Sign in with magic link
            </Button>

            <Divider sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary">
                or
              </Typography>
            </Divider>

            <Typography textAlign="center" color="text.secondary">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                style={{
                  color: "#00684A",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Create Account
              </Link>
            </Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleMagicLinkSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 3.5 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mb: 2, py: 1.5 }}
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<LockOutlined />}
              onClick={() => {
                setLoginMode("password");
                setError("");
                setSuccess("");
              }}
              sx={{ mb: 3 }}
            >
              Sign in with password
            </Button>

            <Divider sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary">
                or
              </Typography>
            </Divider>

            <Typography textAlign="center" color="text.secondary">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                style={{
                  color: "#00684A",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Create Account
              </Link>
            </Typography>
          </Box>
        )}
      </AuthCard>
    </AuthPageWrapper>
  );
}
