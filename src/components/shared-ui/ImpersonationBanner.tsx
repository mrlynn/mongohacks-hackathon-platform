"use client";

import { useState, useEffect, useCallback } from "react";
import { Alert, Button, Box } from "@mui/material";
import { ExitToApp as ExitIcon } from "@mui/icons-material";
import { useRouter, usePathname } from "next/navigation";

export default function ImpersonationBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState("");

  const checkImpersonation = useCallback(() => {
    const cookies = document.cookie.split(";");
    const nameCookie = cookies.find((c) =>
      c.trim().startsWith("impersonate_user_name=")
    );
    if (nameCookie) {
      const name = decodeURIComponent(nameCookie.split("=")[1].trim());
      setImpersonatedUser(name);
      setIsImpersonating(true);
    } else {
      setImpersonatedUser("");
      setIsImpersonating(false);
    }
  }, []);

  // Re-check on mount and on every navigation
  useEffect(() => {
    checkImpersonation();
  }, [pathname, checkImpersonation]);

  const handleStopImpersonation = async () => {
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "DELETE",
      });

      if (res.ok) {
        // Immediately update UI state
        setIsImpersonating(false);
        setImpersonatedUser("");
        
        // Navigate back to admin users page
        router.push("/admin/users");
        
        // Force a hard refresh to clear any cached session data
        window.location.href = "/admin/users";
      } else {
        console.error("Failed to stop impersonation - server returned error");
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
          <strong>Admin Mode:</strong> You are viewing the site as{" "}
          {impersonatedUser ? <strong>{impersonatedUser}</strong> : "a user"}. Some features may be limited.
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
