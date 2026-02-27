"use client";

import { useState, useEffect } from "react";
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
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  AdminPanelSettings as AdminIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  EmojiEvents as EmojiEventsIcon,
  Map as MapIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Gavel as GavelIcon,
  MenuBook as MenuBookIcon,
  Collections as GalleryIcon,
} from "@mui/icons-material";
import { useColorScheme } from "@mui/material/styles";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import NotificationBell from "./NotificationBell";

function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !mode) return null;

  return (
    <Tooltip
      title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <IconButton
        color="inherit"
        onClick={() => setMode(mode === "dark" ? "light" : "dark")}
        size="small"
        aria-label="Toggle theme"
      >
        {mode === "dark" ? (
          <LightModeIcon fontSize="small" />
        ) : (
          <DarkModeIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { data: session, status } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  const user = session?.user as
    | { id?: string; name?: string; email?: string; role?: string }
    | undefined;

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (href: string) => {
    handleClose();
    setMobileDrawerOpen(false);
    router.push(href);
  };

  const handleSignOut = async () => {
    handleClose();
    setMobileDrawerOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const isActive = (path: string) => pathname === path;

  // Mobile Drawer Content
  const mobileMenu = (
    <Box
      sx={{ width: 280, pt: 2 }}
      role="presentation"
    >
      <Box sx={{ px: 2, pb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Image src="/mongodb-icon.svg" alt="MongoDB" width={24} height={24} style={{ filter: "brightness(0) invert(1)" }} />
          <Typography variant="h6" fontWeight={700}>
            MongoDB Hackathons
          </Typography>
        </Box>
        <IconButton onClick={toggleMobileDrawer} edge="end">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {user && (
        <>
          <Box sx={{ px: 2, py: 2, bgcolor: "grey.50" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "primary.main",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.name || "User"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={user.role || "user"}
              size="small"
              sx={{
                bgcolor: "primary.main",
                color: "white",
                fontWeight: 600,
                textTransform: "uppercase",
                fontSize: "0.7rem",
              }}
            />
          </Box>
          <Divider />
        </>
      )}

      <List sx={{ py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleNavigate("/events")}
            selected={isActive("/events")}
          >
            <ListItemIcon>
              <EmojiEventsIcon />
            </ListItemIcon>
            <ListItemText primary="Events" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleNavigate("/events/map")}
            selected={isActive("/events/map")}
          >
            <ListItemIcon>
              <MapIcon />
            </ListItemIcon>
            <ListItemText primary="Map" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleNavigate("/gallery")}
            selected={isActive("/gallery")}
          >
            <ListItemIcon>
              <GalleryIcon />
            </ListItemIcon>
            <ListItemText primary="Gallery" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component="a"
            href="https://docs.mongohacks.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ListItemIcon>
              <MenuBookIcon />
            </ListItemIcon>
            <ListItemText primary="Documentation" />
          </ListItemButton>
        </ListItem>

        {user && (
          <>
            <Divider sx={{ my: 1 }} />
            
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigate("/dashboard")}
                selected={isActive("/dashboard")}
              >
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>

            {(user.role === "judge" || user.role === "admin" || user.role === "super_admin") && (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate("/judging")}
                  selected={pathname.startsWith("/judging")}
                >
                  <ListItemIcon>
                    <GavelIcon />
                  </ListItemIcon>
                  <ListItemText primary="Judging" />
                </ListItemButton>
              </ListItem>
            )}

            {(user.role === "admin" || user.role === "super_admin") && (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate("/admin")}
                  selected={pathname.startsWith("/admin")}
                  sx={{
                    bgcolor: isActive("/admin") ? "primary.light" : "transparent",
                    "&:hover": {
                      bgcolor: "primary.light",
                    },
                  }}
                >
                  <ListItemIcon>
                    <AdminIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Admin"
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItemButton>
              </ListItem>
            )}

            <Divider sx={{ my: 1 }} />

            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigate("/profile")}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigate("/settings")}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>

            <Divider sx={{ my: 1 }} />

            <ListItem disablePadding>
              <ListItemButton onClick={handleSignOut}>
                <ListItemIcon>
                  <LogoutIcon color="error" />
                </ListItemIcon>
                <ListItemText primary="Sign Out" />
              </ListItemButton>
            </ListItem>
          </>
        )}

        {!user && mounted && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding sx={{ px: 2, py: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleNavigate("/login")}
                sx={{ mb: 1 }}
              >
                Sign In
              </Button>
            </ListItem>
            <ListItem disablePadding sx={{ px: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleNavigate("/register")}
              >
                Register
              </Button>
            </ListItem>
          </>
        )}
      </List>

      <Box sx={{ px: 2, py: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Theme:
          </Typography>
          <ThemeToggle />
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Container maxWidth="xl" disableGutters sx={{ px: { xs: 1, sm: 2 } }}>
          <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 } }}>
            {/* Mobile Menu Icon */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open menu"
                onClick={toggleMobileDrawer}
                edge="start"
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Image src="/mongodb-icon.svg" alt="MongoDB" width={28} height={28} style={{ marginRight: 8, filter: "brightness(0) invert(1)" }} />
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
                sx={{
                  fontWeight: 700,
                  color: "inherit",
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                }}
              >
                MongoDB Hackathons
              </Typography>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <ThemeToggle />
                {user && <NotificationBell />}

                <Button
                  color="inherit"
                  href="/events"
                  startIcon={<EmojiEventsIcon />}
                  sx={{ textTransform: "none" }}
                >
                  Events
                </Button>
                <Button
                  color="inherit"
                  href="/events/map"
                  startIcon={<MapIcon />}
                  sx={{ textTransform: "none" }}
                >
                  Map
                </Button>
                <Button
                  color="inherit"
                  href="/gallery"
                  startIcon={<GalleryIcon />}
                  sx={{ textTransform: "none" }}
                >
                  Gallery
                </Button>

                <Button
                  color="inherit"
                  href="https://docs.mongohacks.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<MenuBookIcon />}
                  sx={{ textTransform: "none" }}
                >
                  Docs
                </Button>

                {mounted && (
                  <>
                    {user ? (
                      <>


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
                            <Chip
                              label={user.role || "user"}
                              size="small"
                              sx={{
                                mt: 0.5,
                                bgcolor: "primary.main",
                                color: "white",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                fontSize: "0.7rem",
                              }}
                            />
                          </Box>

                          <Divider />

                          <MenuItem onClick={() => handleNavigate("/dashboard")}>
                            <ListItemIcon>
                              <DashboardIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Dashboard</ListItemText>
                          </MenuItem>

                          {(user.role === "judge" || user.role === "admin" || user.role === "super_admin") && (
                            <MenuItem onClick={() => handleNavigate("/judging")}>
                              <ListItemIcon>
                                <GavelIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText>Judging</ListItemText>
                            </MenuItem>
                          )}

                          {(user.role === "admin" || user.role === "super_admin") && (
                            <MenuItem onClick={() => handleNavigate("/admin")}>
                              <ListItemIcon>
                                <AdminIcon fontSize="small" color="primary" />
                              </ListItemIcon>
                              <ListItemText>Admin</ListItemText>
                            </MenuItem>
                          )}

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
                            textTransform: "none",
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
                            textTransform: "none",
                          }}
                        >
                          Register
                        </Button>
                      </>
                    )}
                  </>
                )}
              </Box>
            )}

            {/* Mobile: Just show theme toggle and avatar */}
            {isMobile && mounted && user && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <ThemeToggle />
                <NotificationBell />
                <IconButton onClick={handleMenu} size="small">
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
                    sx: { minWidth: 200, mt: 1 },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Signed in as
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {user?.name || "User"}
                    </Typography>
                    <Chip
                      label={user.role || "user"}
                      size="small"
                      sx={{
                        mt: 0.5,
                        bgcolor: "primary.main",
                        color: "white",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        fontSize: "0.7rem",
                      }}
                    />
                  </Box>

                  <Divider />

                  <MenuItem onClick={() => handleNavigate("/dashboard")}>
                    <ListItemIcon>
                      <DashboardIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Dashboard</ListItemText>
                  </MenuItem>

                  {(user.role === "judge" || user.role === "admin" || user.role === "super_admin") && (
                    <MenuItem onClick={() => handleNavigate("/judging")}>
                      <ListItemIcon>
                        <GavelIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Judging</ListItemText>
                    </MenuItem>
                  )}

                  {(user.role === "admin" || user.role === "super_admin") && (
                    <MenuItem onClick={() => handleNavigate("/admin")}>
                      <ListItemIcon>
                        <AdminIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText>Admin</ListItemText>
                    </MenuItem>
                  )}

                  <Divider />

                  <MenuItem onClick={() => handleNavigate("/profile")}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Profile</ListItemText>
                  </MenuItem>

                  <MenuItem onClick={handleSignOut}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Sign Out</ListItemText>
                  </MenuItem>
                </Menu>
              </Box>
            )}

            {isMobile && !user && mounted && (
              <ThemeToggle />
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={toggleMobileDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: 280,
          },
        }}
      >
        {mobileMenu}
      </Drawer>
    </>
  );
}
