"use client";

import { Box, Container, Typography, Button } from "@mui/material";
import { SectionRenderProps, getFontStack, getSpacingMultiplier } from "@/lib/types/template";

export default function CtaSection({ config, sectionConfig, event }: SectionRenderProps) {
  const { colors, typography, hero } = config;
  const spacingMul = getSpacingMultiplier(sectionConfig.style.spacing);
  const ctaText = event.landingPage?.customContent?.hero?.ctaText || "Register Now";

  const getBgStyles = () => {
    switch (sectionConfig.style.bgStyle) {
      case "gradient":
        return {
          background: `linear-gradient(${hero.gradientDirection}, ${colors.heroBg} 0%, ${colors.heroBgEnd} 100%)`,
          color: "#FFFFFF",
        };
      case "primary":
        return { bgcolor: colors.primary, color: "#FFFFFF" };
      case "dark":
        return { bgcolor: colors.background, color: colors.text };
      case "light":
      default:
        return { bgcolor: colors.surface, color: colors.text };
    }
  };

  const bgStyles = getBgStyles();
  const isLight = sectionConfig.style.bgStyle === "light";

  const getButtonStyles = () => {
    const base = {
      fontWeight: 700,
      px: 6,
      py: 1.5,
      fontSize: "1.1rem",
      transition: "all 0.2s ease",
      "&:hover": { transform: "translateY(-2px)" },
    };

    if (isLight) {
      return {
        ...base,
        bgcolor: colors.primary,
        color: "#FFFFFF",
        "&:hover": { ...base["&:hover"], bgcolor: colors.primary, opacity: 0.9 },
        borderRadius: hero.buttonStyle === "pill" ? 50 : hero.buttonStyle === "square" ? 0 : 2,
      };
    }

    return {
      ...base,
      bgcolor: colors.buttonBg,
      color: colors.buttonText,
      "&:hover": { ...base["&:hover"], bgcolor: colors.buttonBg, opacity: 0.9 },
      borderRadius: hero.buttonStyle === "pill" ? 50 : hero.buttonStyle === "square" ? 0 : 2,
    };
  };

  return (
    <Box sx={{ ...bgStyles, py: { xs: 8 * spacingMul, md: 12 * spacingMul }, textAlign: "center" }}>
      <Container maxWidth="md">
        <Typography
          variant="h3"
          sx={{
            fontWeight: typography.headingWeight,
            fontFamily: getFontStack(typography.headingFont),
            color: bgStyles.color,
            mb: 2,
          }}
        >
          Ready to Hack?
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontFamily: getFontStack(typography.bodyFont),
            color: bgStyles.color,
            opacity: 0.9,
            mb: 4,
          }}
        >
          Join us for an incredible hackathon experience
        </Typography>
        <Button variant="contained" size="large" disableElevation sx={getButtonStyles()}>
          {ctaText}
        </Button>
      </Container>
    </Box>
  );
}
