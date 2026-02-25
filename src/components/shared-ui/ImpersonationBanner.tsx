"use client";

import { useState, useEffect } from "react";
import { Alert, Button, Box } from "@mui/material";
import { ExitToApp as ExitIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function ImpersonationBanner() {
  const router = useRouter();
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState("");

  useEffect(() => {
    // Check if impersonation cookie exists
    const checkImpersonation = () => {
      const cookies = document.cookie.split(";");
      const impersonateCookie = cookies.find((c) =>
        c.trim().startsWith("impersonate_user_id=")
      );
      setIsImpersonating(!!impersonateCookie);
    };

    checkImpersonation();
  }, []);

  const handleStopImpersonation = async () => {
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "DELETE",
      });

      if (res.ok) {
        setIsImpersonating(false);
        router.push("/admin/users");
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to stop impersonation:", err);
    }
  };

  if (!isImpersonating) return null;

  return (
    <Alert
      severity="warning"
      sx={{
        borderRadius: 0,
        position: "sticky",
        top: 0,
        zIndex: 1200,
        "& .MuiAlert-message": {
          width: "100%",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <span>
          <strong>Admin Mode:</strong> You are viewing the site as a user. Some features may be limited.
        </span>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<ExitIcon />}
          onClick={handleStopImpersonation}
          sx={{ ml: 2, whiteSpace: "nowrap" }}
        >
          Exit View As
        </Button>
      </Box>
    </Alert>
  );
}
