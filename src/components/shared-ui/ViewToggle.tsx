"use client";

import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import { ViewList as TableIcon, ViewModule as CardIcon } from "@mui/icons-material";

interface ViewToggleProps {
  view: "table" | "card";
  onChange: (view: "table" | "card") => void;
}

export default function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <ToggleButtonGroup
      value={view}
      exclusive
      onChange={(_, newView) => {
        if (newView !== null) {
          onChange(newView);
        }
      }}
      size="small"
    >
      <ToggleButton value="table" aria-label="table view">
        <TableIcon fontSize="small" />
      </ToggleButton>
      <ToggleButton value="card" aria-label="card view">
        <CardIcon fontSize="small" />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
