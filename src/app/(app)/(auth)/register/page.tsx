"use client";

import { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  MenuItem,
  InputAdornment,
  Divider,
} from "@mui/material";
import {
  PersonOutlined,
  EmailOutlined,
  LockOutlined,
  BadgeOutlined,
  CheckCircleOutline,
} from "@mui/icons-material";
import Link from "next/link";
import {
  AuthPageWrapper,
  AuthCard,
  AuthBranding,
} from "@/components/shared-ui/FormElements";

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
      <AuthPageWrapper>
        <AuthBranding />
        <AuthCard>
          <Box sx={{ textAlign: "center", py: 2 }}>
            <CheckCircleOutline
              className="success-icon"
              sx={{ fontSize: 72, color: "success.main", mb: 2 }}
            />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Registration Successful!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Your account has been created. You can now sign in.
            </Typography>
            <Button variant="contained" href="/login" size="large">
              Sign In
            </Button>
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
          Create Account
        </Typography>
        <Typography
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          Join MongoDB Hackathons to participate in hackathons
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
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
            sx={{ mb: 2.5 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
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
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            required
            sx={{ mb: 2.5 }}
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
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            required
            sx={{ mb: 2.5 }}
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
          <TextField
            fullWidth
            select
            label="Role"
            value={formData.role}
            onChange={(e) => handleChange("role", e.target.value)}
            sx={{ mb: 3.5 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
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
            sx={{ mb: 3, py: 1.5 }}
          >
            Create Account
          </Button>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary">
              or
            </Typography>
          </Divider>

          <Typography textAlign="center" color="text.secondary">
            Already have an account?{" "}
            <Link
              href="/login"
              style={{
                color: "#00684A",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
      </AuthCard>
    </AuthPageWrapper>
  );
}
