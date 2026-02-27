"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Collapse,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  IconButton,
  useMediaQuery,
  useTheme,
  Typography,
  alpha,
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
  SmartToy as RagIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { usePathname } from "next/navigation";

const drawerWidth = 240;

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: <DashboardIcon /> },
      { label: "Analytics", href: "/admin/analytics", icon: <AnalyticsIcon /> },
    ],
  },
  {
    id: "event-management",
    label: "Event Management",
    items: [
      { label: "Events", href: "/admin/events", icon: <EventIcon /> },
      { label: "Teams", href: "/admin/teams", icon: <TeamsIcon /> },
      { label: "Projects", href: "/admin/projects", icon: <FolderIcon /> },
      { label: "Judges", href: "/admin/judges", icon: <GavelIcon /> },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    items: [
      { label: "Users", href: "/admin/users", icon: <PeopleIcon /> },
      { label: "Partners", href: "/admin/partners", icon: <BusinessIcon /> },
      { label: "RAG / Chat", href: "/admin/rag", icon: <RagIcon /> },
      { label: "Templates", href: "/admin/settings/templates", icon: <PaletteIcon /> },
      { label: "Settings", href: "/admin/settings", icon: <SettingsIcon /> },
    ],
  },
];

// Flatten for active-route matching logic
const allNavItems = navGroups.flatMap((g) => g.items);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  // Determine which group contains the active route so we can auto-expand it
  const activeGroupId = navGroups.find((g) =>
    g.items.some((item) => isActiveRoute(item.href, pathname))
  )?.id;

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  function isActiveRoute(href: string, currentPath: string): boolean {
    if (href === "/admin") return currentPath === "/admin";
    const moreSpecificMatch = allNavItems.some(
      (other) =>
        other.href !== href &&
        other.href.startsWith(href) &&
        currentPath.startsWith(other.href)
    );
    if (moreSpecificMatch) return false;
    return currentPath.startsWith(href);
  }

  const isGroupExpanded = (groupId: string) => {
    // If explicitly toggled, respect that; otherwise expand if it has the active item
    if (groupId in collapsedGroups) return !collapsedGroups[groupId];
    return groupId === activeGroupId || groupId === "overview";
  };

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId] ? true : false,
    }));
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const sectionHeaderSx = {
    px: 2,
    pt: 2,
    pb: 0.5,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    userSelect: "none" as const,
    borderRadius: 1,
    mx: 1,
    "&:hover": {
      bgcolor: alpha(theme.palette.text.primary, 0.04),
    },
  };

  const drawerContent = (
    <Box sx={{ overflow: "auto", mt: 1, pb: 2 }}>
      {isMobile && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", px: 1 }}>
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
      )}

      {navGroups.map((group, groupIndex) => {
        const expanded = isGroupExpanded(group.id);
        const groupHasActive = group.items.some((item) =>
          isActiveRoute(item.href, pathname)
        );

        return (
          <Box key={group.id}>
            {/* Section header */}
            <Box
              onClick={() => toggleGroup(group.id)}
              sx={sectionHeaderSx}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: groupHasActive
                    ? "primary.main"
                    : "text.disabled",
                  transition: "color 0.2s",
                }}
              >
                {group.label}
              </Typography>
              {expanded ? (
                <ExpandLessIcon
                  sx={{ fontSize: 16, color: "text.disabled" }}
                />
              ) : (
                <ExpandMoreIcon
                  sx={{ fontSize: 16, color: "text.disabled" }}
                />
              )}
            </Box>

            {/* Collapsible nav items */}
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <List disablePadding dense>
                {group.items.map((item) => {
                  const active = isActiveRoute(item.href, pathname);
                  return (
                    <ListItem key={item.href} disablePadding>
                      <Link
                        href={item.href}
                        style={{
                          textDecoration: "none",
                          color: "inherit",
                          width: "100%",
                        }}
                        onClick={() => isMobile && setMobileOpen(false)}
                      >
                        <ListItemButton
                          selected={active}
                          sx={{
                            mx: 1,
                            borderRadius: 1,
                            py: 0.75,
                            "&.Mui-selected": {
                              bgcolor: "rgba(0, 237, 100, 0.1)",
                              color: "primary.main",
                              boxShadow: "inset 3px 0 0 currentColor",
                              "&:hover": {
                                bgcolor: "rgba(0, 237, 100, 0.15)",
                              },
                              "& .MuiListItemIcon-root": {
                                color: "primary.main",
                              },
                              "& .MuiListItemText-primary": {
                                fontWeight: 700,
                              },
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{ minWidth: 36, color: "text.secondary" }}
                          >
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                              fontSize: "0.875rem",
                              fontWeight: 500,
                            }}
                          />
                        </ListItemButton>
                      </Link>
                    </ListItem>
                  );
                })}
              </List>
            </Collapse>
          </Box>
        );
      })}
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
