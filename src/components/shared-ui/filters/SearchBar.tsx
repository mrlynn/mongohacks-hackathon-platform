"use client";

import { useState, useEffect } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { SearchOutlined, CloseOutlined } from "@mui/icons-material";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  fullWidth?: boolean;
}

/**
 * Debounced search input with clear button
 * 
 * Features:
 * - Auto-debounce to reduce re-renders
 * - Clear button when text exists
 * - Keyboard shortcut support (Cmd+K)
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
  fullWidth = true,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce: update parent state after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange, value]);

  // Sync external changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const input = document.querySelector(
          'input[placeholder*="Search"]'
        ) as HTMLInputElement;
        input?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <TextField
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder}
      size="small"
      fullWidth={fullWidth}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchOutlined sx={{ color: "text.secondary" }} />
          </InputAdornment>
        ),
        endAdornment: localValue && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear} edge="end">
              <CloseOutlined fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          backgroundColor: "background.paper",
        },
      }}
    />
  );
}
