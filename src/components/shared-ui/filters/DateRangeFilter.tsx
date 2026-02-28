"use client";

import { Box, Typography, TextField, Stack } from "@mui/material";

interface DateRangeFilterProps {
  label: string;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

/**
 * Date range picker with start and end dates
 * 
 * Features:
 * - Native date inputs
 * - Validation (end >= start)
 * - Optional clear
 */
export default function DateRangeFilter({
  label,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeFilterProps) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ display: "block", mb: 1, fontWeight: 600, color: "text.secondary" }}
      >
        {label}
      </Typography>
      <Stack spacing={1.5}>
        <TextField
          type="date"
          label="From"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          type="date"
          label="To"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
          fullWidth
          inputProps={{ min: startDate || undefined }}
        />
      </Stack>
    </Box>
  );
}
