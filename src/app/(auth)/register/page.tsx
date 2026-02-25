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
  MenuItem,
} from "@mui/material";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "participant",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("An error occurred. Please try again.");
    }
  }

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Registration Successful!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Your account has been created. You can now sign in.
            </Typography>
            <Button variant="contained" component={Link} href="/login">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
            Create Account
          </Typography>
          <Typography
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 3 }}
          >
            Join HackPlatform to participate in hackathons
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              select
              label="Role"
              value={formData.role}
              onChange={(e) => handleChange("role", e.target.value)}
              sx={{ mb: 3 }}
            >
              <MenuItem value="participant">Participant</MenuItem>
              <MenuItem value="organizer">Organizer</MenuItem>
              <MenuItem value="judge">Judge</MenuItem>
            </TextField>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mb: 2 }}
            >
              Create Account
            </Button>
            <Typography textAlign="center" color="text.secondary">
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#6366f1" }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
