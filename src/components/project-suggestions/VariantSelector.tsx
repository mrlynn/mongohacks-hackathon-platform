"use client";

import { Box, Chip, Typography } from "@mui/material";
import {
  AccountTree as FullIcon,
  Storage as BackendIcon,
  Palette as FrontendIcon,
} from "@mui/icons-material";

type PromptVariant = "full-scaffold" | "backend-first" | "frontend-first";

interface VariantSelectorProps {
  value: PromptVariant;
  onChange: (variant: PromptVariant) => void;
}

const variants = [
  {
    value: "full-scaffold" as PromptVariant,
    label: "Full Scaffold",
    icon: <FullIcon />,
    description: "Complete project setup — frontend, backend, and database",
  },
  {
    value: "backend-first" as PromptVariant,
    label: "Backend First",
    icon: <BackendIcon />,
    description: "Database schema, API routes, and business logic",
  },
  {
    value: "frontend-first" as PromptVariant,
    label: "Frontend First",
    icon: <FrontendIcon />,
    description: "Component tree, pages, and UI integration",
  },
];

export default function VariantSelector({
  value,
  onChange,
}: VariantSelectorProps) {
  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 600, mb: 1.5, color: "text.secondary" }}
      >
        Choose Starting Point:
      </Typography>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {variants.map((variant) => (
          <Chip
            key={variant.value}
            label={variant.label}
            icon={variant.icon}
            onClick={() => onChange(variant.value)}
            color={value === variant.value ? "primary" : "default"}
            variant={value === variant.value ? "filled" : "outlined"}
            sx={{
              py: 2.5,
              "& .MuiChip-label": {
                fontWeight: value === variant.value ? 600 : 400,
              },
            }}
          />
        ))}
      </Box>

      {/* Show description for selected variant */}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        {variants.find((v) => v.value === value)?.description}
      </Typography>
    </Box>
  );
}
