"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  TextField,
  Button,
  Chip,
  InputAdornment,
} from "@mui/material";
import {
  EmojiEvents as EmojiEventsIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { mongoBrand } from "@/styles/theme";

/* ─── Auth Page Wrapper ─── dark slate background with dot pattern ─── */
/* Intentionally always dark — this is the login/register backdrop */
export function AuthPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${mongoBrand.slateBlue} 0%, ${mongoBrand.evergreen} 50%, ${mongoBrand.slateBlue} 100%)`,
        position: "relative",
        py: 8,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        {children}
      </Container>
    </Box>
  );
}

/* ─── Auth Card ─── elevated white card with green top glow ─── */
export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow:
          "0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        position: "relative",
        overflow: "visible",
        "&::before": {
          content: '""',
          position: "absolute",
          top: -1,
          left: "20%",
          right: "20%",
          height: 3,
          borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${mongoBrand.springGreen}, transparent)`,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 5 } }}>{children}</CardContent>
    </Card>
  );
}

/* ─── Auth Branding ─── trophy icon + MongoDB Hackathons heading ─── */
/* Intentionally always white text — sits on dark auth background */
export function AuthBranding() {
  return (
    <Box sx={{ textAlign: "center", mb: 4 }}>
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: 3,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "primary.main",
          boxShadow: `0 4px 16px rgba(0, 104, 74, 0.4)`,
          mb: 2,
        }}
      >
        <EmojiEventsIcon sx={{ fontSize: 36, color: "primary.contrastText" }} />
      </Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: mongoBrand.white,
          letterSpacing: "-0.01em",
        }}
      >
        MongoDB Hackathons
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "rgba(255,255,255,0.5)", mt: 0.5 }}
      >
        Hackathon Platform
      </Typography>
    </Box>
  );
}

/* ─── Form Card ─── card with colored gradient top accent border ─── */
interface FormCardProps {
  children: React.ReactNode;
  accentColor?: string;
  accentColorEnd?: string;
}

export function FormCard({
  children,
  accentColor,
  accentColorEnd,
}: FormCardProps) {
  return (
    <Card
      sx={(theme) => ({
        mb: 3,
        position: "relative",
        overflow: "visible",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 24,
          right: 24,
          height: 3,
          borderRadius: "0 0 3px 3px",
          background: `linear-gradient(90deg, ${accentColor || theme.vars?.palette.primary.main || theme.palette.primary.main}, ${accentColorEnd || theme.vars?.palette.secondary.main || theme.palette.secondary.main})`,
        },
      })}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 }, pt: { xs: 3.5, md: 4.5 } }}>
        {children}
      </CardContent>
    </Card>
  );
}

/* ─── Form Section Header ─── icon + title + subtitle ─── */
interface FormSectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function FormSectionHeader({
  icon,
  title,
  subtitle,
}: FormSectionHeaderProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
      <Box
        sx={(theme) => ({
          width: 40,
          height: 40,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: `color-mix(in srgb, ${theme.vars?.palette.primary.main || theme.palette.primary.main} 8%, transparent)`,
          color: "primary.main",
          flexShrink: 0,
        })}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/* ─── Page Header ─── page title with gradient icon badge ─── */
interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        {icon && (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {title}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {subtitle}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/* ─── Chip Input ─── reusable tag/skill input with branded chips ─── */
interface ChipInputProps {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
  icon?: React.ReactNode;
}

export function ChipInput({
  label,
  placeholder,
  values,
  onChange,
  icon,
}: ChipInputProps) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      setInput("");
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          slotProps={{
            input: {
              startAdornment: icon ? (
                <InputAdornment position="start">{icon}</InputAdornment>
              ) : undefined,
            },
          }}
        />
        <Button
          variant="outlined"
          onClick={handleAdd}
          sx={{ minWidth: "auto", px: 2 }}
        >
          <AddIcon />
        </Button>
      </Box>
      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", minHeight: 32 }}>
        {values.length === 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ py: 0.5 }}
          >
            No items added yet
          </Typography>
        )}
        {values.map((v) => (
          <Chip
            key={v}
            label={v}
            onDelete={() => onChange(values.filter((x) => x !== v))}
            size="small"
            sx={(theme) => ({
              borderRadius: "6px",
              fontWeight: 500,
              bgcolor: `color-mix(in srgb, ${theme.vars?.palette.primary.main || theme.palette.primary.main} 8%, transparent)`,
              color: "primary.dark",
              border: `1px solid color-mix(in srgb, ${theme.vars?.palette.primary.main || theme.palette.primary.main} 20%, transparent)`,
              "& .MuiChip-deleteIcon": {
                color: "primary.main",
                "&:hover": { color: "primary.dark" },
              },
              ...theme.applyStyles("dark", {
                color: "primary.light",
                "& .MuiChip-deleteIcon": {
                  color: "primary.light",
                  "&:hover": { color: "primary.main" },
                },
              }),
            })}
          />
        ))}
      </Box>
    </Box>
  );
}

/* ─── Form Actions ─── footer action buttons with top divider ─── */
export function FormActions({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        justifyContent: "flex-end",
        pt: 3,
        mt: 1,
      }}
    >
      {children}
    </Box>
  );
}
