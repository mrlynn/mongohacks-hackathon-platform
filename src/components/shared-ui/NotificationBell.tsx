"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
  Tooltip,
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
  registration_confirmed: <RegistrationIcon color="success" fontSize="small" />,
  event_reminder: <EventIcon color="primary" fontSize="small" />,
  team_member_joined: <TeamJoinIcon color="primary" fontSize="small" />,
  team_member_left: <TeamLeaveIcon color="warning" fontSize="small" />,
  team_invite: <TeamJoinIcon color="secondary" fontSize="small" />,
  project_submitted: <ProjectIcon color="success" fontSize="small" />,
  results_published: <EventIcon color="primary" fontSize="small" />,
  judge_assigned: <JudgeIcon color="primary" fontSize="small" />,
  score_received: <ScoreIcon color="primary" fontSize="small" />,
  general: <GeneralIcon fontSize="small" />,
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

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const eventSourceRef = useRef<EventSource | null>(null);

  // SSE connection for real-time unread count
  useEffect(() => {
    function connect() {
      const es = new EventSource("/api/notifications/stream");
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setUnreadCount(data.unreadCount);
        } catch {}
      };

      es.onerror = () => {
        es.close();
        // Reconnect after 10 seconds
        setTimeout(connect, 10000);
      };
    }

    connect();

    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=10");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch {}
    setLoading(false);
  }, []);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => setAnchorEl(null);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "PATCH" });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      fetch(`/api/notifications/${notification._id}/read`, {
        method: "PATCH",
      }).catch(() => {});
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id ? { ...n, read: true } : n
        )
      );
    }
    handleClose();
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleOpen}
          size="small"
          aria-label="Notifications"
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsOutlined fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: { width: 360, maxHeight: 480 },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          )}
        </Box>

        <Divider />

        {loading && notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary" variant="body2">
              Loading...
            </Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <NotificationsOutlined
              sx={{ fontSize: 40, color: "text.disabled", mb: 1 }}
            />
            <Typography color="text.secondary" variant="body2">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ py: 0 }}>
            {notifications.map((n) => (
              <ListItem
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                sx={{
                  cursor: "pointer",
                  bgcolor: n.read ? "transparent" : "action.hover",
                  "&:hover": { bgcolor: "action.selected" },
                  borderLeft: n.read ? "none" : "3px solid",
                  borderLeftColor: "primary.main",
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {typeIcons[n.type] || typeIcons.general}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      fontWeight={n.read ? 400 : 600}
                      noWrap
                    >
                      {n.title}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {n.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ display: "block", mt: 0.25 }}
                      >
                        {timeAgo(n.createdAt)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        <Divider />
        <Box sx={{ p: 1, textAlign: "center" }}>
          <Button
            size="small"
            onClick={() => {
              handleClose();
              router.push("/notifications");
            }}
          >
            View all notifications
          </Button>
        </Box>
      </Popover>
    </>
  );
}
