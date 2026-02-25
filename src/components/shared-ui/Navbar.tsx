"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Menu,
  MenuItem,
  Chip,
  IconButton,
} from "@mui/material";
import {
  AccountCircle as AccountCircleIcon,
  AdminPanelSettings as AdminIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  EmojiEvents as EmojiEventsIcon,
  Map as MapIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const user = session?.user as { id?: string; name?: string; email?: string; role?: string } | undefined;
  const loading = status === "loading";

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleClose();
    await signOut({ callbackUrl: "/" });
  };

  return (
    <AppBar position="sticky" elevation={1} sx={{ bgcolor: "primary.main" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <EmojiEventsIcon sx={{ mr: 1, fontSize: 32 }} />
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              flexGrow: 1,
              textDecoration: "none",
              color: "inherit",
              fontWeight: 700,
            }}
          >
            MongoHacks
          </Typography>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button
              color="inherit"
              component={Link}
              href="/events"
              startIcon={<EmojiEventsIcon />}
            >
              Events
            </Button>
            <Button
              color="inherit"
              component={Link}
              href="/events/map"
              startIcon={<MapIcon />}
            >
              Map
            </Button>

            {!loading && (
              <>
                {user ? (
                  <>
                    {/* Show Admin link for admin users */}
                    {(user as any).role === "admin" && (
                      <Button
                        color="inherit"
                        component={Link}
                        href="/admin"
                        startIcon={<AdminIcon />}
                        sx={{
                          bgcolor: "rgba(255, 255, 255, 0.1)",
                          "&:hover": {
                            bgcolor: "rgba(255, 255, 255, 0.2)",
                          },
                        }}
                      >
                        Admin
                      </Button>
                    )}

                    <Button
                      color="inherit"
                      component={Link}
                      href="/dashboard"
                      startIcon={<DashboardIcon />}
                    >
                      Dashboard
                    </Button>

                    <Chip
                      label={(user as any).role || "user"}
                      size="small"
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.2)",
                        color: "inherit",
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    />

                    <IconButton
                      size="large"
                      onClick={handleMenu}
                      color="inherit"
                    >
                      <AccountCircleIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                    >
                      <MenuItem disabled>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {user?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user?.email}
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem onClick={handleClose} component={Link} href="/profile">
                        Profile
                      </MenuItem>
                      <MenuItem onClick={handleSignOut}>
                        <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
                        Sign Out
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <>
                    <Button
                      color="inherit"
                      component={Link}
                      href="/login"
                      variant="outlined"
                      sx={{
                        borderColor: "rgba(255, 255, 255, 0.5)",
                        "&:hover": {
                          borderColor: "rgba(255, 255, 255, 1)",
                        },
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      color="inherit"
                      component={Link}
                      href="/register"
                      variant="contained"
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.9)",
                        color: "primary.main",
                        "&:hover": {
                          bgcolor: "rgba(255, 255, 255, 1)",
                        },
                      }}
                    >
                      Register
                    </Button>
                  </>
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
