"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  InputAdornment,
  Divider,
} from "@mui/material";
import {
  EmailOutlined,
  LockOutlined,
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const { signIn } = await import("next-auth/react");
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        window.location.href = redirectTo || "/dashboard";
      }
    } catch {
      setError("An error occurred. Please try again.");
    }
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
          Sign in to your hackathon account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
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
            sx={{ mb: 3, py: 1.5 }}
          >
            Sign In
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
      </AuthCard>
    </AuthPageWrapper>
  );
}
