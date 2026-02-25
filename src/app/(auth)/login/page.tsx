"use client";

import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Box,
  Alert,
} from "@mui/material";
import Link from "next/link";

export default function LoginPage() {
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
        window.location.href = "/dashboard";
      }
    } catch {
      setError("An error occurred. Please try again.");
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
            Sign In
          </Typography>
          <Typography
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 3 }}
          >
            Welcome back to HackPlatform
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
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
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mb: 2 }}
            >
              Sign In
            </Button>
            <Typography textAlign="center" color="text.secondary">
              Don&apos;t have an account?{" "}
              <Link href="/register" style={{ color: "#6366f1" }}>
                Register
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
