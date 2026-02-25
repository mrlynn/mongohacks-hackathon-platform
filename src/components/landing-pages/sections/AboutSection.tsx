"use client";

import { Box, Container, Typography } from "@mui/material";
import { SectionRenderProps, getFontStack, getSpacingMultiplier, getSectionBgStyle } from "@/lib/types/template";

export default function AboutSection({ config, sectionConfig, event }: SectionRenderProps) {
  const { colors, typography } = config;
  const aboutText = event.landingPage?.customContent?.about || event.description;
  const spacingMul = getSpacingMultiplier(sectionConfig.style.spacing);
  const bg = getSectionBgStyle(sectionConfig.style.bgStyle, colors, 1);

  return (
    <Box sx={{ ...bg, py: { xs: 6 * spacingMul, md: 10 * spacingMul } }}>
      <Container maxWidth="md">
        <Typography
          variant="h3"
          sx={{
            fontWeight: typography.headingWeight,
            fontFamily: getFontStack(typography.headingFont),
            color: bg.color,
            mb: 4,
            textAlign: "center",
          }}
        >
          About
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: getFontStack(typography.bodyFont),
            color: sectionConfig.style.bgStyle === "primary" || sectionConfig.style.bgStyle === "gradient"
              ? "rgba(255,255,255,0.9)"
              : colors.textSecondary,
            fontSize: "1.125rem",
            lineHeight: 1.9,
            textAlign: "center",
          }}
        >
          {aboutText}
        </Typography>
      </Container>
    </Box>
  );
}
