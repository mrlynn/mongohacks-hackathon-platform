"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  NotificationsOutlined,
  EmojiEvents as EventIcon,
  GroupAdd as TeamJoinIcon,
  GroupRemove as TeamLeaveIcon,
  Assignment as ProjectIcon,
  Gavel as JudgeIcon,
  ScoreboardOutlined as ScoreIcon,
  Campaign as GeneralIcon,
  CheckCircleOutline as RegistrationIcon,
  DoneAll as DoneAllIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared-ui/FormElements";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  registration_confirmed: <RegistrationIcon color="success" />,
  event_reminder: <EventIcon color="primary" />,
  team_member_joined: <TeamJoinIcon color="primary" />,
  team_member_left: <TeamLeaveIcon color="warning" />,
  team_invite: <TeamJoinIcon color="secondary" />,
  project_submitted: <ProjectIcon color="success" />,
  results_published: <EventIcon color="primary" />,
  judge_assigned: <JudgeIcon color="primary" />,
  score_received: <ScoreIcon color="primary" />,
  general: <GeneralIcon />,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [filterType, setFilterType] = useState<string | null>(null);
  const router = useRouter();

  const fetchNotifications = useCallback(
    async (offset = 0) => {
      try {
        const params = new URLSearchParams({
          limit: "20",
          offset: offset.toString(),
        });
        const res = await fetch(`/api/notifications?${params}`);
        const data = await res.json();
        if (data.success) {
          if (offset === 0) {
            setNotifications(data.notifications);
          } else {
            setNotifications((prev) => [...prev, ...data.notifications]);
          }
          setHasMore(data.notifications.length === 20);
        }
      } catch {}
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = async (notification: Notification) => {
    if (!notification.read) {
      fetch(`/api/notifications/${notification._id}/read`, {
        method: "PATCH",
      }).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id ? { ...n, read: true } : n
        )
      );
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const filtered = filterType
    ? notifications.filter((n) => n.type === filterType)
    : notifications;

  const types = [...new Set(notifications.map((n) => n.type))];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageHeader
        icon={<NotificationsOutlined />}
        title="Notifications"
        subtitle="Stay updated on your hackathon activity"
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label="All"
            variant={filterType === null ? "filled" : "outlined"}
            onClick={() => setFilterType(null)}
            size="small"
          />
          {types.map((type) => (
            <Chip
              key={type}
              label={type.replace(/_/g, " ")}
              variant={filterType === type ? "filled" : "outlined"}
              onClick={() => setFilterType(type)}
              size="small"
              sx={{ textTransform: "capitalize" }}
            />
          ))}
        </Box>
        <Button
          size="small"
          startIcon={<DoneAllIcon />}
          onClick={handleMarkAllRead}
        >
          Mark all read
        </Button>
      </Box>

      <Card>
        {loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <NotificationsOutlined
              sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
            />
            <Typography color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {filtered.map((n, i) => (
              <Box key={n._id}>
                {i > 0 && <Divider />}
                <ListItem
                  onClick={() => handleClick(n)}
                  sx={{
                    cursor: n.actionUrl ? "pointer" : "default",
                    bgcolor: n.read ? "transparent" : "action.hover",
                    "&:hover": { bgcolor: "action.selected" },
                    borderLeft: n.read ? "none" : "4px solid",
                    borderLeftColor: "primary.main",
                    py: 2,
                  }}
                >
                  <ListItemIcon>
                    {typeIcons[n.type] || typeIcons.general}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography fontWeight={n.read ? 400 : 600}>
                        {n.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {n.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          {timeAgo(n.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        )}

        {hasMore && !loading && filtered.length >= 20 && (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Button
              onClick={() => fetchNotifications(notifications.length)}
            >
              Load more
            </Button>
          </Box>
        )}
      </Card>
    </Container>
  );
}
