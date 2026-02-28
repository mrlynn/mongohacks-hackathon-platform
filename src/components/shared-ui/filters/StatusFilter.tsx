"use client";

import { Chip, Stack, Box, Typography } from "@mui/material";

interface StatusFilterProps {
  label?: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  options: Array<{ value: string; label: string; color?: string }>;
  multiple?: boolean;
}

/**
 * Quick-access status filter using chips
 * 
 * Features:
 * - Single or multi-select
 * - Custom colors per status
 * - "All" option for single-select
 */
export default function StatusFilter({
  label,
  value,
  onChange,
  options,
  multiple = false,
}: StatusFilterProps) {
  const selectedSet = new Set(Array.isArray(value) ? value : [value]);

  const handleClick = (optionValue: string) => {
    if (multiple) {
      const newSet = new Set(selectedSet);
      if (newSet.has(optionValue)) {
        newSet.delete(optionValue);
      } else {
        newSet.add(optionValue);
      }
      onChange(Array.from(newSet));
    } else {
      onChange(value === optionValue ? "" : optionValue);
    }
  };

  const handleClearAll = () => {
    onChange(multiple ? [] : "");
  };

  return (
    <Box>
      {label && (
        <Typography
          variant="caption"
          sx={{ display: "block", mb: 1, fontWeight: 600, color: "text.secondary" }}
        >
          {label}
        </Typography>
      )}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {!multiple && (
          <Chip
            label="All"
            onClick={handleClearAll}
            variant={!value ? "filled" : "outlined"}
            size="small"
            sx={{
              fontWeight: !value ? 600 : 400,
            }}
          />
        )}
        {options.map((option) => {
          const isSelected = selectedSet.has(option.value);
          return (
            <Chip
              key={option.value}
              label={option.label}
              onClick={() => handleClick(option.value)}
              variant={isSelected ? "filled" : "outlined"}
              size="small"
              color={option.color as any}
              sx={{
                fontWeight: isSelected ? 600 : 400,
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );
}
