"use client";

import { Button, Box, Divider, Typography } from "@mui/material";
import { GitHub as GitHubIcon } from "@mui/icons-material";
import { signIn } from "next-auth/react";
import { useState } from "react";

interface OAuthButtonsProps {
  eventId?: string;
}

export default function OAuthButtons({ eventId }: OAuthButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    try {
      const callbackUrl = eventId 
        ? `/events/${eventId}/hub`
        : "/dashboard";
      
      await signIn("github", {
        callbackUrl,
      });
    } catch (error) {
      console.error("GitHub sign-in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Button
        fullWidth
        variant="outlined"
        size="large"
        startIcon={<GitHubIcon />}
        onClick={handleGitHubSignIn}
        disabled={isLoading}
        sx={{
          borderColor: "#24292e",
          color: "#24292e",
          "&:hover": {
            borderColor: "#24292e",
            backgroundColor: "rgba(36, 41, 46, 0.04)",
          },
          textTransform: "none",
          fontWeight: 600,
          py: 1.5,
        }}
      >
        {isLoading ? "Connecting..." : "Continue with GitHub"}
      </Button>

      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary">
          or
        </Typography>
      </Divider>
    </Box>
  );
}
