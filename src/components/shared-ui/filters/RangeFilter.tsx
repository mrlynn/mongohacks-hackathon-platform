"use client";

import { Box, Typography, Slider, TextField, Stack } from "@mui/material";
import { useState, useEffect } from "react";

interface RangeFilterProps {
  label: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  unit?: string;
}

/**
 * Numeric range filter with slider and text inputs
 * 
 * Features:
 * - Dual-thumb slider
 * - Manual min/max inputs
 * - Optional unit label
 */
export default function RangeFilter({
  label,
  min,
  max,
  value,
  onChange,
  step = 1,
  unit = "",
}: RangeFilterProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    const range = newValue as [number, number];
    setLocalValue(range);
  };

  const handleSliderCommit = () => {
    onChange(localValue);
  };

  const handleMinChange = (newMin: string) => {
    const num = Math.max(min, Math.min(localValue[1], parseInt(newMin) || min));
    const newRange: [number, number] = [num, localValue[1]];
    setLocalValue(newRange);
    onChange(newRange);
  };

  const handleMaxChange = (newMax: string) => {
    const num = Math.min(max, Math.max(localValue[0], parseInt(newMax) || max));
    const newRange: [number, number] = [localValue[0], num];
    setLocalValue(newRange);
    onChange(newRange);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        sx={{ display: "block", mb: 1.5, fontWeight: 600, color: "text.secondary" }}
      >
        {label}
      </Typography>

      {/* Slider */}
      <Slider
        value={localValue}
        onChange={handleSliderChange}
        onChangeCommitted={handleSliderCommit}
        min={min}
        max={max}
        step={step}
        valueLabelDisplay="auto"
        valueLabelFormat={(val) => `${val}${unit}`}
        sx={{ mt: 1, mb: 2 }}
      />

      {/* Min/Max inputs */}
      <Stack direction="row" spacing={1}>
        <TextField
          label="Min"
          type="number"
          value={localValue[0]}
          onChange={(e) => handleMinChange(e.target.value)}
          size="small"
          InputProps={{
            endAdornment: unit ? (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {unit}
              </Typography>
            ) : null,
          }}
          inputProps={{ min, max: localValue[1], step }}
          fullWidth
        />
        <TextField
          label="Max"
          type="number"
          value={localValue[1]}
          onChange={(e) => handleMaxChange(e.target.value)}
          size="small"
          InputProps={{
            endAdornment: unit ? (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {unit}
              </Typography>
            ) : null,
          }}
          inputProps={{ min: localValue[0], max, step }}
          fullWidth
        />
      </Stack>
    </Box>
  );
}
