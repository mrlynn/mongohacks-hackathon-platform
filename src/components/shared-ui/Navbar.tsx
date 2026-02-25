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
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  AdminPanelSettings as AdminIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  EmojiEvents as EmojiEventsIcon,
  Map as MapIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import Link from "next/link";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const user = session?.user as
    | { id?: string; name?: string; email?: string; role?: string }
    | undefined;
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
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: "inherit",
              flexGrow: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "inherit" }}
            >
              MongoHacks
            </Typography>
          </Link>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Link href="/events" passHref legacyBehavior>
              <Button color="inherit" startIcon={<EmojiEventsIcon />}>
                Events
              </Button>
            </Link>
            <Link href="/events/map" passHref legacyBehavior>
              <Button color="inherit" startIcon={<MapIcon />}>
                Map
              </Button>
            </Link>

            {!loading && (
              <>
                {user ? (
                  <>
                    {user.role === "admin" && (
                      <Link href="/admin" passHref legacyBehavior>
                        <Button
                          color="inherit"
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
                      </Link>
                    )}

                    <Link href="/dashboard" passHref legacyBehavior>
                      <Button color="inherit" startIcon={<DashboardIcon />}>
                        Dashboard
                      </Button>
                    </Link>

                    <Chip
                      label={user.role || "user"}
                      size="small"
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.2)",
                        color: "inherit",
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    />

                    <IconButton onClick={handleMenu} sx={{ ml: 1 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: "secondary.main",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                        }}
                      >
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </Avatar>
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                      transformOrigin={{
                        horizontal: "right",
                        vertical: "top",
                      }}
                      anchorOrigin={{
                        horizontal: "right",
                        vertical: "bottom",
                      }}
                      PaperProps={{
                        elevation: 3,
                        sx: { minWidth: 220, mt: 1 },
                      }}
                    >
                      <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {user?.name || "User"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user?.email}
                        </Typography>
                      </Box>

                      <Divider />

                      <Link
                        href="/profile"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <MenuItem onClick={handleClose}>
                          <ListItemIcon>
                            <PersonIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Profile</ListItemText>
                        </MenuItem>
                      </Link>

                      <Link
                        href="/settings"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <MenuItem onClick={handleClose}>
                          <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Settings</ListItemText>
                        </MenuItem>
                      </Link>

                      <Divider />

                      <MenuItem onClick={handleSignOut}>
                        <ListItemIcon>
                          <LogoutIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText>Sign Out</ListItemText>
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <>
                    <Link href="/login" passHref legacyBehavior>
                      <Button
                        color="inherit"
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
                    </Link>
                    <Link href="/register" passHref legacyBehavior>
                      <Button
                        color="inherit"
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
                    </Link>
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
