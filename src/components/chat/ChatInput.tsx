"use client";

import { useState, useRef, useCallback } from "react";
import { Box, TextField, IconButton } from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
      <TextField
        inputRef={inputRef}
        fullWidth
        size="small"
        placeholder="Ask a question..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        multiline
        maxRows={3}
        slotProps={{
          input: {
            sx: { fontSize: "0.875rem" },
          },
        }}
      />
      <IconButton
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        color="primary"
        size="small"
        sx={{ mb: 0.25 }}
      >
        <SendIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
