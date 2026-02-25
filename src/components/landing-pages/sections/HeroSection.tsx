"use client";

import { Box, Container, Typography, Button, Chip, Stack } from "@mui/material";
import { CalendarMonth, LocationOn } from "@mui/icons-material";
import { SectionRenderProps, getFontStack, getSpacingMultiplier } from "@/lib/types/template";

export default function HeroSection({ config, sectionConfig, event }: SectionRenderProps) {
  const { colors, hero, typography } = config;
  const content = event.landingPage?.customContent?.hero;
  const spacingMul = getSpacingMultiplier(sectionConfig.style.spacing);

  const headline = content?.headline || event.name;
  const subheadline = content?.subheadline || event.description;
  const ctaText = content?.ctaText || "Register Now";
  const bgImage = content?.backgroundImage;

  const isLight = hero.style === "light";
  const textColor = isLight ? colors.text : colors.heroText;

  const getBgStyles = () => {
    switch (hero.style) {
      case "gradient":
        return {
          background: `linear-gradient(${hero.gradientDirection}, ${colors.heroBg} 0%, ${colors.heroBgEnd} 100%)`,
        };
      case "solid":
        return { bgcolor: colors.heroBg };
      case "image-overlay":
        return {
          background: bgImage
            ? `linear-gradient(${hero.gradientDirection}, rgba(0,0,0,${hero.overlayOpacity}), rgba(0,0,0,${hero.overlayOpacity})), url(${bgImage}) center/cover`
            : `linear-gradient(${hero.gradientDirection}, ${colors.heroBg} 0%, ${colors.heroBgEnd} 100%)`,
        };
      case "light":
      default:
        return { bgcolor: colors.background };
    }
  };

  const getButtonStyles = () => {
    const base = {
      bgcolor: colors.buttonBg,
      color: colors.buttonText,
      fontWeight: 700,
      px: 6,
      py: 1.5,
      fontSize: "1.1rem",
      "&:hover": {
        bgcolor: colors.buttonBg,
        opacity: 0.9,
        transform: "translateY(-2px)",
      },
      transition: "all 0.2s ease",
    };
    switch (hero.buttonStyle) {
      case "pill": return { ...base, borderRadius: 50 };
      case "square": return { ...base, borderRadius: 0 };
      case "rounded":
      default: return { ...base, borderRadius: 2 };
    }
  };

  return (
    <Box
      sx={{
        ...getBgStyles(),
        py: { xs: 8 * spacingMul, md: 16 * spacingMul },
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h2"
          sx={{
            fontWeight: typography.headingWeight,
            fontFamily: getFontStack(typography.headingFont),
            color: textColor,
            mb: 3,
            fontSize: { xs: "2.5rem", md: typography.scale === "large" ? "4rem" : "3.5rem" },
            letterSpacing: "-0.02em",
          }}
        >
          {headline}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            fontFamily: getFontStack(typography.bodyFont),
            color: textColor,
            opacity: 0.9,
            mb: 4,
            maxWidth: 600,
            mx: "auto",
            lineHeight: 1.6,
          }}
        >
          {subheadline}
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 4 }}>
          <Chip
            icon={<CalendarMonth sx={{ color: `${textColor} !important` }} />}
            label={new Date(event.startDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            sx={{
              bgcolor: isLight ? `${colors.primary}15` : "rgba(255,255,255,0.15)",
              color: textColor,
              fontWeight: 600,
              py: 2.5,
              px: 1,
            }}
          />
          <Chip
            icon={<LocationOn sx={{ color: `${textColor} !important` }} />}
            label={event.location}
            sx={{
              bgcolor: isLight ? `${colors.primary}15` : "rgba(255,255,255,0.15)",
              color: textColor,
              fontWeight: 600,
              py: 2.5,
              px: 1,
            }}
          />
        </Stack>

        <Button
          variant="contained"
          size="large"
          disableElevation
          component="a"
          href={`/events/${event._id}/register`}
          sx={getButtonStyles()}
        >
          {ctaText}
        </Button>
      </Container>
    </Box>
  );
}
