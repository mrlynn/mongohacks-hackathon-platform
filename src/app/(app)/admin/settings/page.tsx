"use client";

import {
  Box, Typography, Card, CardContent, CardActionArea, Grid, Chip,
} from "@mui/material";
import {
  Palette as PaletteIcon,
  Settings as SettingsIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
