"use client";

import { FormControl, Select, MenuItem, IconButton, Box } from "@mui/material";
import { SwapVertOutlined, ArrowUpwardOutlined, ArrowDownwardOutlined } from "@mui/icons-material";

interface SortOption {
  value: string;
  label: string;
}

interface SortControlProps {
  sortField: string;
  sortDirection: "asc" | "desc";
  onSortFieldChange: (field: string) => void;
  onSortDirectionChange: (direction: "asc" | "desc") => void;
  options: SortOption[];
}

/**
 * Sort field selector with direction toggle
 * 
 * Features:
 * - Dropdown for sort field
 * - Toggle button for asc/desc
 * - Visual indicators
 */
export default function SortControl({
  sortField,
  sortDirection,
  onSortFieldChange,
  onSortDirectionChange,
  options,
}: SortControlProps) {
  const toggleDirection = () => {
    onSortDirectionChange(sortDirection === "asc" ? "desc" : "asc");
  };

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <Select
          value={sortField}
          onChange={(e) => onSortFieldChange(e.target.value)}
          startAdornment={<SwapVertOutlined sx={{ mr: 1, color: "text.secondary" }} />}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <IconButton onClick={toggleDirection} size="small" sx={{ border: 1, borderColor: "divider" }}>
        {sortDirection === "asc" ? (
          <ArrowUpwardOutlined fontSize="small" />
        ) : (
          <ArrowDownwardOutlined fontSize="small" />
        )}
      </IconButton>
    </Box>
  );
}
