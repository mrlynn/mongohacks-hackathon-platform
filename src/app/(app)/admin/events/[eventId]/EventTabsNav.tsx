"use client";

import {
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  Button,
  Container,
} from "@mui/material";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Gavel as GavelIcon,
  CardGiftcard as PrizesIcon,
  EmojiEvents as TrophyIcon,
  People as PeopleIcon,
  Web as WebIcon,
} from "@mui/icons-material";

const TAB_CONFIG = [
  { label: "Edit", path: "edit", icon: <EditIcon fontSize="small" /> },
  { label: "Judging", path: "judging", icon: <GavelIcon fontSize="small" /> },
  { label: "Prizes", path: "prizes", icon: <PrizesIcon fontSize="small" /> },
  { label: "Results", path: "results", icon: <TrophyIcon fontSize="small" /> },
  {
    label: "Registrations",
    path: "registrations",
    icon: <PeopleIcon fontSize="small" />,
  },
  {
    label: "Landing Page",
    path: "landing-page",
    icon: <WebIcon fontSize="small" />,
  },
];

const statusColors: Record<
  string,
  "default" | "success" | "info" | "warning" | "error" | "primary"
> = {
  draft: "default",
  open: "success",
  in_progress: "info",
  concluded: "warning",
};

interface EventTabsNavProps {
  eventId: string;
  eventName: string;
  eventStatus: string;
}

export default function EventTabsNav({
  eventId,
  eventName,
  eventStatus,
}: EventTabsNavProps) {
  const pathname = usePathname();

  const activeTab = TAB_CONFIG.findIndex(
    (tab) =>
      pathname.endsWith(`/${tab.path}`) || pathname.includes(`/${tab.path}/`)
  );

  const basePath = `/admin/events/${eventId}`;

  return (
    <Container maxWidth="xl" sx={{ pt: { xs: 1, sm: 2 } }}>
      {/* Back link */}
      <Button
        component={Link}
        href="/admin/events"
        startIcon={<ArrowBackIcon />}
        size="small"
        sx={{ mb: 1, color: "text.secondary" }}
      >
        All Events
      </Button>

      {/* Event name + status */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
        >
          {eventName}
        </Typography>
        <Chip
          label={eventStatus.replace("_", " ")}
          size="small"
          color={statusColors[eventStatus] || "default"}
          sx={{ textTransform: "capitalize" }}
        />
      </Box>

      {/* Tab bar */}
      <Tabs
        value={activeTab >= 0 ? activeTab : false}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 500,
            minHeight: 48,
          },
        }}
      >
        {TAB_CONFIG.map((tab) => (
          <Tab
            key={tab.path}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
            component={Link}
            href={`${basePath}/${tab.path}`}
          />
        ))}
      </Tabs>
    </Container>
  );
}
