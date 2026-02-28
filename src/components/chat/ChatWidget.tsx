"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Fab,
  Paper,
  Typography,
  IconButton,
  Slide,
  useMediaQuery,
  useTheme,
  Drawer,
  Tooltip,
  alpha,
} from "@mui/material";
import {
  Close as CloseIcon,
  OpenInFull as ExpandIcon,
  CloseFullscreen as CollapseIcon,
} from "@mui/icons-material";
import MongoLeafIcon from "../icons/MongoLeafIcon";
import { usePathname } from "next/navigation";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

interface Source {
  title: string;
  url: string;
  section: string;
  relevanceScore: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  feedback?: "up" | "down" | null;
}

const SESSION_KEY = "mongohacks-chat-session";

function getStoredSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SESSION_KEY);
}

function storeSessionId(id: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SESSION_KEY, id);
  }
}

// Panel size presets
const PANEL_SIZES = {
  compact: { width: 380, height: 500 },
  expanded: { width: 600, height: "calc(100vh - 100px)" as string | number },
} as const;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const panelSize = expanded ? PANEL_SIZES.expanded : PANEL_SIZES.compact;

  // Restore session ID on mount
  useEffect(() => {
    const stored = getStoredSessionId();
    if (stored) setSessionId(stored);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keyboard shortcut: Cmd/Ctrl + K to toggle, Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const handleSend = useCallback(
    async (message: string) => {
      // Add user message
      setMessages((prev) => [...prev, { role: "user", content: message }]);
      setIsStreaming(true);

      // Start with empty assistant message
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", sources: [] },
      ]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            sessionId,
            page: pathname,
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: "Request failed" }));
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: err.error || "Something went wrong. Please try again.",
            };
            return updated;
          });
          setIsStreaming(false);
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          setIsStreaming(false);
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6);

            try {
              const event = JSON.parse(jsonStr);

              if (event.type === "chunk") {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + event.content,
                  };
                  return updated;
                });
              } else if (event.type === "sources") {
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    sources: event.sources,
                  };
                  return updated;
                });
              } else if (event.type === "done") {
                if (event.sessionId) {
                  setSessionId(event.sessionId);
                  storeSessionId(event.sessionId);
                }
              } else if (event.type === "error") {
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: event.error,
                  };
                  return updated;
                });
              }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }
      } catch {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "Connection error. Please try again.",
          };
          return updated;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [sessionId, pathname]
  );

  const handleFeedback = (index: number, feedback: "up" | "down") => {
    setMessages((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        feedback: updated[index].feedback === feedback ? null : feedback,
      };
      return updated;
    });
  };

  const chatContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: isMobile ? "100%" : panelSize.height,
        width: isMobile ? "100%" : panelSize.width,
        transition: "width 0.2s ease, height 0.2s ease",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MongoLeafIcon sx={{ fontSize: 20, color: "primary.main" }} />
          <Typography variant="subtitle2" fontWeight={600}>
            MongoHacks Assistant
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
          {!isMobile && (
            <Tooltip title={expanded ? "Compact view" : "Expand"}>
              <IconButton size="small" onClick={() => setExpanded((prev) => !prev)}>
                {expanded ? (
                  <CollapseIcon sx={{ fontSize: 18 }} />
                ) : (
                  <ExpandIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small" onClick={() => setOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 2,
          py: 1.5,
          minHeight: 0,
        }}
      >
        {messages.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <MongoLeafIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Hi! I&apos;m the MongoHacks Assistant.
              <br />
              Ask me anything about the platform.
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: "block" }}>
              Ctrl+K to toggle &middot; Esc to close
            </Typography>
          </Box>
        )}

        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            role={msg.role}
            content={msg.content}
            sources={msg.sources}
            feedback={msg.feedback}
            onFeedback={
              msg.role === "assistant"
                ? (fb) => handleFeedback(i, fb)
                : undefined
            }
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
          />
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </Box>
    </Box>
  );

  return (
    <>
      {/* Floating Action Button */}
      {!open && (
        <Fab
          color="primary"
          aria-label="Open chat assistant"
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: (theme) => theme.zIndex.modal - 1,
          }}
        >
          <MongoLeafIcon />
        </Fab>
      )}

      {/* Mobile: Full-screen drawer */}
      {isMobile ? (
        <Drawer
          anchor="bottom"
          open={open}
          onClose={() => setOpen(false)}
          PaperProps={{
            sx: {
              height: "100%",
              maxHeight: "100%",
            },
          }}
        >
          {chatContent}
        </Drawer>
      ) : (
        /* Desktop: Slide-up panel */
        <Slide direction="up" in={open} mountOnEnter unmountOnExit>
          <Paper
            elevation={8}
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: (theme) => theme.zIndex.modal - 1,
              borderRadius: 2,
              overflow: "hidden",
              transition: "width 0.2s ease, height 0.2s ease",
            }}
          >
            {chatContent}
          </Paper>
        </Slide>
      )}
    </>
  );
}
