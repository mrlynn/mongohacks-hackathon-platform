"use client";

import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Stack,
  Collapse,
  Button,
} from "@mui/material";
import { ExpandMoreOutlined, ExpandLessOutlined } from "@mui/icons-material";
import { useState } from "react";

interface MultiSelectOption {
  value: string;
  label: string;
  count?: number;
}

interface MultiSelectFilterProps {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  showCounts?: boolean;
}

/**
 * Multi-select filter with checkboxes
 * 
 * Features:
 * - Checkbox list
 * - Optional item counts
 * - Collapsible groups
 * - Select all/none
 */
export default function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  collapsible = true,
  defaultExpanded = true,
  showCounts = true,
}: MultiSelectFilterProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const selectedSet = new Set(selected);

  const handleToggle = (value: string) => {
    const newSet = new Set(selectedSet);
    if (newSet.has(value)) {
      newSet.delete(value);
    } else {
      newSet.add(value);
    }
    onChange(Array.from(newSet));
  };

  const handleSelectAll = () => {
    onChange(options.map((o) => o.value));
  };

  const handleSelectNone = () => {
    onChange([]);
  };

  const allSelected = options.length > 0 && selectedSet.size === options.length;
  const someSelected = selectedSet.size > 0 && selectedSet.size < options.length;

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
          cursor: collapsible ? "pointer" : "default",
        }}
        onClick={collapsible ? () => setExpanded(!expanded) : undefined}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, color: "text.secondary" }}
        >
          {label}
          {selectedSet.size > 0 && (
            <Typography
              component="span"
              variant="caption"
              sx={{ ml: 1, color: "primary.main", fontWeight: 700 }}
            >
              ({selectedSet.size})
            </Typography>
          )}
        </Typography>
        {collapsible &&
          (expanded ? (
            <ExpandLessOutlined fontSize="small" sx={{ color: "text.secondary" }} />
          ) : (
            <ExpandMoreOutlined fontSize="small" sx={{ color: "text.secondary" }} />
          ))}
      </Box>

      <Collapse in={expanded}>
        <Stack spacing={0.5}>
          {/* Select all/none */}
          {options.length > 3 && (
            <Box sx={{ display: "flex", gap: 1, mb: 0.5 }}>
              <Button
                size="small"
                onClick={handleSelectAll}
                disabled={allSelected}
                sx={{ fontSize: "0.75rem", textTransform: "none", p: 0.5 }}
              >
                Select All
              </Button>
              <Button
                size="small"
                onClick={handleSelectNone}
                disabled={selectedSet.size === 0}
                sx={{ fontSize: "0.75rem", textTransform: "none", p: 0.5 }}
              >
                Clear
              </Button>
            </Box>
          )}

          {/* Checkboxes */}
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={selectedSet.has(option.value)}
                  onChange={() => handleToggle(option.value)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2">
                  {option.label}
                  {showCounts && option.count !== undefined && (
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ ml: 0.5, color: "text.secondary" }}
                    >
                      ({option.count})
                    </Typography>
                  )}
                </Typography>
              }
              sx={{ ml: 0, mr: 0 }}
            />
          ))}
        </Stack>
      </Collapse>
    </Box>
  );
}
