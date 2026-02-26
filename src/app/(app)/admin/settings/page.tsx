"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, CardActionArea, Grid, Chip,
  Snackbar, Alert, CircularProgress, Tooltip, Paper,
} from "@mui/material";
import {
  Palette as PaletteIcon,
  Settings as SettingsIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckIcon,
  HideImage as NoneIcon,
} from "@mui/icons-material";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const BACKGROUNDS = [
  { file: "collaboration.jpg", label: "Collaboration" },
  { file: "corporate.jpg",     label: "Corporate" },
  { file: "fishbowl.jpg",      label: "Fishbowl" },
  { file: "hackathon.jpg",     label: "Hackathon" },
  { file: "illustrated.jpg",   label: "Illustrated" },
  { file: "startup-office.jpg",label: "Startup Office" },
  { file: "teamwork.jpg",      label: "Teamwork" },
];

function HeroBackgroundPicker() {
  const [current, setCurrent] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; severity: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/admin/site-settings")
      .then((r) => r.json())
      .then((d) => setCurrent(d.heroBackground ?? null));
  }, []);

  const select = async (file: string | null) => {
    setSaving(file ?? "__none__");
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroBackground: file }),
      });
      if (res.ok) {
        setCurrent(file);
        setToast({ msg: file ? `Background set to "${file}"` : "Background cleared", severity: "success" });
      } else {
        setToast({ msg: "Failed to save", severity: "error" });
      }
    } catch {
      setToast({ msg: "Failed to save", severity: "error" });
    } finally {
      setSaving(null);
    }
  };

  return (
    <Box sx={{ mb: 5 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
        Landing Page Hero Background
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose the background image shown in the homepage hero section.
      </Typography>

      <Grid container spacing={2}>
        {/* None option */}
        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
          <Tooltip title="Use default dark background (no image)">
            <Paper
              onClick={() => select(null)}
              elevation={current === null ? 4 : 1}
              sx={{
                cursor: "pointer",
                borderRadius: 2,
                overflow: "hidden",
                border: 2,
                borderColor: current === null ? "primary.main" : "divider",
                transition: "all 0.15s",
                "&:hover": { borderColor: "primary.main", transform: "translateY(-2px)" },
                position: "relative",
              }}
            >
              <Box
                sx={{
                  height: 90,
                  bgcolor: "background.default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {saving === "__none__" ? (
                  <CircularProgress size={24} />
                ) : (
                  <NoneIcon sx={{ fontSize: 32, color: "text.disabled" }} />
                )}
              </Box>
              <Box sx={{ p: 1, textAlign: "center" }}>
                <Typography variant="caption" fontWeight={600}>
                  None
                </Typography>
              </Box>
              {current === null && (
                <CheckIcon
                  sx={{
                    position: "absolute", top: 6, right: 6,
                    color: "primary.main", fontSize: 20,
                    bgcolor: "background.paper", borderRadius: "50%",
                  }}
                />
              )}
            </Paper>
          </Tooltip>
        </Grid>

        {BACKGROUNDS.map(({ file, label }) => (
          <Grid key={file} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
            <Paper
              onClick={() => select(file)}
              elevation={current === file ? 4 : 1}
              sx={{
                cursor: "pointer",
                borderRadius: 2,
                overflow: "hidden",
                border: 2,
                borderColor: current === file ? "primary.main" : "divider",
                transition: "all 0.15s",
                "&:hover": { borderColor: "primary.main", transform: "translateY(-2px)" },
                position: "relative",
              }}
            >
              <Box sx={{ height: 90, position: "relative" }}>
                <Image
                  src={`/backgrounds/${file}`}
                  alt={label}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="200px"
                />
                {saving === file && (
                  <Box
                    sx={{
                      position: "absolute", inset: 0,
                      bgcolor: "rgba(0,0,0,0.5)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  </Box>
                )}
              </Box>
              <Box sx={{ p: 1, textAlign: "center" }}>
                <Typography variant="caption" fontWeight={600}>{label}</Typography>
              </Box>
              {current === file && (
                <CheckIcon
                  sx={{
                    position: "absolute", top: 6, right: 6,
                    color: "primary.main", fontSize: 20,
                    bgcolor: "background.paper", borderRadius: "50%",
                  }}
                />
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast?.severity} onClose={() => setToast(null)}>
          {toast?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const isSuperAdmin = userRole === "super_admin";

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure platform settings and preferences
        </Typography>
      </Box>

      <HeroBackgroundPicker />

      <Grid container spacing={3}>
        {isSuperAdmin && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={2} sx={{ height: "100%" }}>
                <CardActionArea
                  onClick={() => router.push("/admin/settings/templates")}
                  sx={{ height: "100%", p: 0 }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <PaletteIcon sx={{ color: "#fff", fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Templates
                        </Typography>
                        <Chip label="Super Admin" size="small" color="warning" sx={{ mt: 0.5 }} />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Create, customize, and manage landing page templates. Control colors, typography,
                      section layout, and card styles with a live visual editor.
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={2} sx={{ height: "100%" }}>
                <CardActionArea
                  onClick={() => router.push("/admin/settings/registration-forms")}
                  sx={{ height: "100%", p: 0 }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: "secondary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <AssignmentIcon sx={{ color: "#fff", fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Registration Forms
                        </Typography>
                        <Chip label="Super Admin" size="small" color="warning" sx={{ mt: 0.5 }} />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Create and customize multi-step registration forms for hackathon events.
                      Configure tiers, custom questions, and profile fields.
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </>
        )}

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "grey.300",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SettingsIcon sx={{ color: "grey.600", fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Platform Config
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Configure email notifications, judging rubrics, and more. Coming soon.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
