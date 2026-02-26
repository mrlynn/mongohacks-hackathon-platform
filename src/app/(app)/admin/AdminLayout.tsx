"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Gavel as GavelIcon,
  Folder as FolderIcon,
  Settings as SettingsIcon,
  Groups as TeamsIcon,
  Palette as PaletteIcon,
  Business as BusinessIcon,
  Analytics as AnalyticsIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";
import { usePathname } from "next/navigation";

const drawerWidth = 240;

const baseNavItems = [
  { label: "Dashboard", href: "/admin", icon: <DashboardIcon /> },
  { label: "Analytics", href: "/admin/analytics", icon: <AnalyticsIcon /> },
  { label: "Events", href: "/admin/events", icon: <EventIcon /> },
  { label: "Users", href: "/admin/users", icon: <PeopleIcon /> },
  { label: "Teams", href: "/admin/teams", icon: <TeamsIcon /> },
  { label: "Judges", href: "/admin/judges", icon: <GavelIcon /> },
  { label: "Projects", href: "/admin/projects", icon: <FolderIcon /> },
  { label: "Partners", href: "/admin/partners", icon: <BusinessIcon /> },
  { label: "Templates", href: "/admin/settings/templates", icon: <PaletteIcon /> },
  { label: "Settings", href: "/admin/settings", icon: <SettingsIcon /> },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = baseNavItems;

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    const moreSpecificMatch = navItems.some(
      (other) => other.href !== href && other.href.startsWith(href) && pathname.startsWith(other.href)
    );
    if (moreSpecificMatch) return false;
    return pathname.startsWith(href);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ overflow: "auto", mt: 1 }}>
      {isMobile && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", px: 1 }}>
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
      )}
      <List disablePadding>
        {navItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <Link
              href={item.href}
              style={{ textDecoration: "none", color: "inherit", width: "100%" }}
              onClick={() => isMobile && setMobileOpen(false)}
            >
              <ListItemButton
                selected={isActive(item.href)}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  "&.Mui-selected": {
                    bgcolor: "rgba(0, 237, 100, 0.1)",
                    color: "primary.main",
                    boxShadow: "inset 3px 0 0 currentColor",
                    "&:hover": { bgcolor: "rgba(0, 237, 100, 0.15)" },
                    "& .MuiListItemIcon-root": { color: "primary.main" },
                    "& .MuiListItemText-primary": { fontWeight: 700 },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "text.secondary" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.95rem",
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* Mobile: Floating menu button */}
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open admin menu"
          onClick={handleDrawerToggle}
          sx={{
            position: "fixed",
            bottom: 16,
            left: 16,
            zIndex: (theme) => theme.zIndex.drawer + 1,
            bgcolor: "primary.main",
            color: "white",
            boxShadow: 3,
            "&:hover": { bgcolor: "primary.dark" },
            width: 48,
            height: 48,
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Mobile Drawer (temporary) */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              bgcolor: "background.paper",
              borderRight: "1px solid",
              borderColor: "divider",
              top: { xs: 56, sm: 64 },
              height: { xs: "calc(100% - 56px)", sm: "calc(100% - 64px)" },
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        /* Desktop Drawer (permanent) */
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              bgcolor: "background.paper",
              borderRight: "1px solid",
              borderColor: "divider",
              top: 64,
              height: "calc(100% - 64px)",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: { xs: 2, sm: 3 },
          minHeight: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" },
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 2, md: 3 } }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
