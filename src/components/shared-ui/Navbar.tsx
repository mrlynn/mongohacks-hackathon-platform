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
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
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

  const handleNavigate = (href: string) => {
    handleClose();
    router.push(href);
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
            <Button
              color="inherit"
              href="/events"
              startIcon={<EmojiEventsIcon />}
            >
              Events
            </Button>
            <Button
              color="inherit"
              href="/events/map"
              startIcon={<MapIcon />}
            >
              Map
            </Button>

            {!loading && (
              <>
                {user ? (
                  <>
                    {user.role === "admin" && (
                      <Button
                        color="inherit"
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
                      href="/dashboard"
                      startIcon={<DashboardIcon />}
                    >
                      Dashboard
                    </Button>

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

                      <MenuItem onClick={() => handleNavigate("/profile")}>
                        <ListItemIcon>
                          <PersonIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Profile</ListItemText>
                      </MenuItem>

                      <MenuItem onClick={() => handleNavigate("/settings")}>
                        <ListItemIcon>
                          <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Settings</ListItemText>
                      </MenuItem>

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
                    <Button
                      color="inherit"
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
