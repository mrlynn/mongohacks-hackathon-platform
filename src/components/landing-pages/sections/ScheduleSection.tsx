"use client";

import { Box, Container, Typography, Stack } from "@mui/material";
import { SectionRenderProps, getFontStack, getSpacingMultiplier, getSectionBgStyle } from "@/lib/types/template";

export default function ScheduleSection({ config, sectionConfig, event }: SectionRenderProps) {
  const { colors, typography, cards } = config;
  const schedule = event.landingPage?.customContent?.schedule;
  if (!schedule?.length) return null;

  const spacingMul = getSpacingMultiplier(sectionConfig.style.spacing);
  const bg = getSectionBgStyle(sectionConfig.style.bgStyle, colors, 3);

  const textColor = sectionConfig.style.bgStyle === "primary" || sectionConfig.style.bgStyle === "gradient"
    ? "#FFFFFF" : bg.color;

  const renderTimeline = () => (
    <Stack spacing={3} sx={{ maxWidth: 700, mx: "auto" }}>
      {schedule.map((item, i) => (
        <Box key={i} sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
          {/* Timeline dot and line */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 24 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: colors.primary,
                mt: 0.5,
              }}
            />
            {i < schedule.length - 1 && (
              <Box sx={{ width: 2, flexGrow: 1, bgcolor: `${colors.primary}30`, minHeight: 40 }} />
            )}
          </Box>
          {/* Content */}
          <Box sx={{ pb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: colors.primary,
                fontFamily: getFontStack(typography.bodyFont),
                fontSize: "0.85rem",
              }}
            >
              {item.time}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontFamily: getFontStack(typography.headingFont),
                color: textColor,
              }}
            >
              {item.title}
            </Typography>
            {item.description && (
              <Typography
                variant="body2"
                sx={{ color: sectionConfig.style.bgStyle === "dark" ? colors.textSecondary : colors.textSecondary }}
              >
                {item.description}
              </Typography>
            )}
          </Box>
        </Box>
      ))}
    </Stack>
  );

  const renderStepper = () => (
    <Stack spacing={4} sx={{ maxWidth: 700, mx: "auto" }}>
      {schedule.map((item, i) => (
        <Box key={i} sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
          {/* Numbered circle */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: colors.primary,
              color: colors.heroText || "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "1rem",
              flexShrink: 0,
            }}
          >
            {i + 1}
          </Box>
          <Box>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: colors.primary, fontSize: "0.85rem" }}
            >
              {item.time}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontFamily: getFontStack(typography.headingFont),
                color: textColor,
              }}
            >
              {item.title}
            </Typography>
            {item.description && (
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                {item.description}
              </Typography>
            )}
          </Box>
        </Box>
      ))}
    </Stack>
  );

  const renderList = () => (
    <Stack spacing={2} sx={{ maxWidth: 700, mx: "auto" }}>
      {schedule.map((item, i) => (
        <Box
          key={i}
          sx={{
            p: 3,
            borderRadius: `${cards.borderRadius}px`,
            border: `1px solid ${colors.primary}20`,
            bgcolor: sectionConfig.style.bgStyle === "dark" ? `${colors.primary}08` : colors.surface,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: colors.primary, fontSize: "0.85rem" }}>
            {item.time}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, color: textColor }}>
            {item.title}
          </Typography>
          {item.description && (
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              {item.description}
            </Typography>
          )}
        </Box>
      ))}
    </Stack>
  );

  return (
    <Box sx={{ ...bg, py: { xs: 6 * spacingMul, md: 10 * spacingMul } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          sx={{
            fontWeight: typography.headingWeight,
            fontFamily: getFontStack(typography.headingFont),
            color: textColor,
            mb: 6,
            textAlign: "center",
          }}
        >
          Schedule
        </Typography>

        {sectionConfig.layout === "stepper" && renderStepper()}
        {sectionConfig.layout === "list" && renderList()}
        {(sectionConfig.layout === "timeline" || !["stepper", "list"].includes(sectionConfig.layout)) && renderTimeline()}
      </Container>
    </Box>
  );
}
