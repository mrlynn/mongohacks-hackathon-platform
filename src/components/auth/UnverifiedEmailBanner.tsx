"use client";

import { useState } from "react";
import { Alert, Button, Snackbar } from "@mui/material";
import { Email as EmailIcon } from "@mui/icons-material";

interface UnverifiedEmailBannerProps {
  userEmail?: string;
}

export default function UnverifiedEmailBanner({
  userEmail,
}: UnverifiedEmailBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async () => {
    setIsResending(true);
    setError("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowSuccess(true);
      } else {
        setError(data.error || "Failed to resend verification email");
      }
    } catch (err: any) {
      setError("Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <Alert
        severity="warning"
        icon={<EmailIcon />}
        sx={{
          mb: 3,
          "& .MuiAlert-message": {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: 2,
          },
        }}
      >
        <span>
          <strong>Please verify your email address.</strong> You won't be able to
          submit projects or create teams until your email is verified.
        </span>
        <Button
          variant="outlined"
          size="small"
          onClick={handleResend}
          disabled={isResending}
          sx={{
            whiteSpace: "nowrap",
            borderColor: "warning.main",
            color: "warning.dark",
            "&:hover": {
              borderColor: "warning.dark",
              backgroundColor: "warning.light",
            },
          }}
        >
          {isResending ? "Sending..." : "Resend Email"}
        </Button>
      </Alert>

      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Verification email sent! Please check your inbox.
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setError("")}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}
