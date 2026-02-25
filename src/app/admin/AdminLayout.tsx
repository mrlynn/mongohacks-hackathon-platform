"use client";

import {
  Box,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
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
} from "@mui/icons-material";
import { usePathname } from "next/navigation";

const drawerWidth = 240;

const navItems = [
  { label: "Dashboard", href: "/admin", icon: <DashboardIcon /> },
  { label: "Events", href: "/admin/events", icon: <EventIcon /> },
  { label: "Users", href: "/admin/users", icon: <PeopleIcon /> },
  { label: "Teams", href: "/admin/teams", icon: <TeamsIcon /> },
  { label: "Judges", href: "/admin/judges", icon: <GavelIcon /> },
  { label: "Projects", href: "/admin/projects", icon: <FolderIcon /> },
  { label: "Settings", href: "/admin/settings", icon: <SettingsIcon /> },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Side Navigation Drawer */}
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
        <Box sx={{ overflow: "auto", mt: 1 }}>
          <List disablePadding>
            {navItems.map((item) => (
              <ListItem key={item.href} disablePadding>
                <Link
                  href={item.href}
                  style={{ textDecoration: "none", color: "inherit", width: "100%" }}
                >
                  <ListItemButton
                    selected={isActive(item.href)}
                    sx={{
                      mx: 1,
                      borderRadius: 1,
                      "&.Mui-selected": {
                        bgcolor: "primary.main",
                        color: "white",
                        "&:hover": { bgcolor: "primary.dark" },
                        "& .MuiListItemIcon-root": { color: "white" },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: "primary.main" }}>
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
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 3,
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Container maxWidth="xl">{children}</Container>
      </Box>
    </Box>
  );
}
