"use client";

import { Stack, Chip } from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";

interface ActiveFilter {
  key: string;
  label: string;
  value: string;
}

interface FilterChipsProps {
  filters: ActiveFilter[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

/**
 * Display active filters as removable chips
 * 
 * Features:
 * - One chip per active filter
 * - Remove individual filter
 * - Clear all button
 */
export default function FilterChips({ filters, onRemove, onClearAll }: FilterChipsProps) {
  if (filters.length === 0) return null;

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
      {filters.map((filter) => (
        <Chip
          key={filter.key}
          label={`${filter.label}: ${filter.value}`}
          onDelete={() => onRemove(filter.key)}
          deleteIcon={<CloseOutlined />}
          size="small"
          variant="filled"
          color="primary"
          sx={{ fontWeight: 500 }}
        />
      ))}
      {filters.length > 1 && (
        <Chip
          label="Clear All"
          onClick={onClearAll}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      )}
    </Stack>
  );
}
