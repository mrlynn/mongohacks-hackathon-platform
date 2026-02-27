"use client";

import { Box, Typography, IconButton, alpha } from "@mui/material";
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ThumbDownOutlined as ThumbDownOutlinedIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import ChatSources from "./ChatSources";

interface Source {
  title: string;
  url: string;
  section: string;
  relevanceScore: number;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  feedback?: "up" | "down" | null;
  onFeedback?: (feedback: "up" | "down") => void;
  isStreaming?: boolean;
}

export default function ChatMessage({
  role,
  content,
  sources,
  feedback,
  onFeedback,
  isStreaming,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        mb: 1.5,
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
      }}
    >
      {/* Avatar */}
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: isUser
            ? (theme) => alpha(theme.palette.primary.main, 0.1)
            : (theme) => alpha(theme.palette.secondary.main, 0.1),
          flexShrink: 0,
          mt: 0.25,
        }}
      >
        {isUser ? (
          <PersonIcon sx={{ fontSize: 16, color: "primary.main" }} />
        ) : (
          <BotIcon sx={{ fontSize: 16, color: "secondary.main" }} />
        )}
      </Box>

      {/* Message bubble */}
      <Box
        sx={{
          maxWidth: "85%",
          bgcolor: isUser
            ? (theme) => alpha(theme.palette.primary.main, 0.08)
            : "background.paper",
          border: isUser ? "none" : "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          px: 1.5,
          py: 1,
          minWidth: 0,
        }}
      >
        {isUser ? (
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {content}
          </Typography>
        ) : (
          <Box
            sx={{
              fontSize: "0.875rem",
              lineHeight: 1.6,
              wordBreak: "break-word",
              "& p": {
                m: 0,
                mb: 1,
                "&:last-child": { mb: 0 },
              },
              "& code": {
                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.06),
                px: 0.5,
                py: 0.125,
                borderRadius: 0.5,
                fontFamily: "monospace",
                fontSize: "0.85em",
              },
              "& pre": {
                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.06),
                p: 1.5,
                borderRadius: 1,
                overflow: "auto",
                my: 1,
                "& code": {
                  bgcolor: "transparent",
                  px: 0,
                  py: 0,
                  fontSize: "0.8em",
                },
              },
              "& ul, & ol": {
                pl: 2.5,
                my: 0.5,
              },
              "& li": {
                mb: 0.25,
              },
              "& h1, & h2, & h3, & h4": {
                mt: 1,
                mb: 0.5,
                fontWeight: 600,
                lineHeight: 1.3,
              },
              "& h1": { fontSize: "1.1em" },
              "& h2": { fontSize: "1.05em" },
              "& h3": { fontSize: "1em" },
              "& blockquote": {
                borderLeft: "3px solid",
                borderColor: "divider",
                pl: 1.5,
                ml: 0,
                my: 1,
                color: "text.secondary",
                fontStyle: "italic",
              },
              "& a": {
                color: "primary.main",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              },
              "& table": {
                borderCollapse: "collapse",
                width: "100%",
                my: 1,
                fontSize: "0.85em",
              },
              "& th, & td": {
                border: "1px solid",
                borderColor: "divider",
                px: 1,
                py: 0.5,
                textAlign: "left",
              },
              "& th": {
                fontWeight: 600,
                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
              },
              "& hr": {
                border: "none",
                borderTop: "1px solid",
                borderColor: "divider",
                my: 1,
              },
              "& strong": { fontWeight: 600 },
            }}
          >
            <ReactMarkdown>{content}</ReactMarkdown>
            {isStreaming && (
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  width: 6,
                  height: 14,
                  bgcolor: "text.secondary",
                  ml: 0.25,
                  verticalAlign: "text-bottom",
                  animation: "blink 1s step-end infinite",
                  "@keyframes blink": {
                    "50%": { opacity: 0 },
                  },
                }}
              />
            )}
          </Box>
        )}

        {/* Sources */}
        {sources && sources.length > 0 && <ChatSources sources={sources} />}

        {/* Feedback buttons for assistant messages */}
        {!isUser && !isStreaming && content && onFeedback && (
          <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, justifyContent: "flex-end" }}>
            <IconButton
              size="small"
              onClick={() => onFeedback("up")}
              color={feedback === "up" ? "primary" : "default"}
              sx={{ p: 0.25 }}
            >
              {feedback === "up" ? (
                <ThumbUpIcon sx={{ fontSize: 14 }} />
              ) : (
                <ThumbUpOutlinedIcon sx={{ fontSize: 14 }} />
              )}
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onFeedback("down")}
              color={feedback === "down" ? "error" : "default"}
              sx={{ p: 0.25 }}
            >
              {feedback === "down" ? (
                <ThumbDownIcon sx={{ fontSize: 14 }} />
              ) : (
                <ThumbDownOutlinedIcon sx={{ fontSize: 14 }} />
              )}
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}
