"use client";

import { Box, Container, Typography, Grid, Card, CardContent } from "@mui/material";
import { EmojiEvents as TrophyIcon } from "@mui/icons-material";
import { SectionRenderProps, getFontStack, getSpacingMultiplier, getSectionBgStyle } from "@/lib/types/template";

export default function PrizesSection({ config, sectionConfig, event }: SectionRenderProps) {
  const { colors, typography, cards } = config;
  const prizes = event.landingPage?.customContent?.prizes;
  if (!prizes?.length) return null;

  const spacingMul = getSpacingMultiplier(sectionConfig.style.spacing);
  const bg = getSectionBgStyle(sectionConfig.style.bgStyle, colors, 2);

  const cols = sectionConfig.layout === "grid-2" ? 6 : sectionConfig.layout === "list" ? 12 : 4;

  const getCardStyles = (index: number) => {
    const base: Record<string, unknown> = {
      borderRadius: `${cards.borderRadius}px`,
      height: "100%",
      textAlign: "center",
      transition: "all 0.3s ease",
      "&:hover": { transform: "translateY(-4px)" },
    };

    switch (cards.style) {
      case "border":
        base.border = `1px solid ${sectionConfig.style.bgStyle === "dark" ? `${colors.primary}30` : "#E7EEEC"}`;
        base.boxShadow = "none";
        base.bgcolor = sectionConfig.style.bgStyle === "dark" ? `${colors.primary}08` : colors.background;
        break;
      case "glass":
        base.bgcolor = "rgba(255,255,255,0.05)";
        base.backdropFilter = "blur(12px)";
        base.border = `1px solid ${colors.primary}20`;
        base.boxShadow = "none";
        break;
      case "flat":
        base.boxShadow = "none";
        base.bgcolor = sectionConfig.style.bgStyle === "dark" ? `${colors.primary}08` : colors.surface;
        break;
      case "shadow":
      default:
        base.bgcolor = sectionConfig.style.bgStyle === "dark" ? colors.surface : colors.background;
        break;
    }

    if (cards.accentPosition === "top") {
      base.borderTop = `3px solid ${colors.primary}`;
    } else if (cards.accentPosition === "left") {
      base.borderLeft = `4px solid ${colors.primary}`;
    }

    return base;
  };

  const textColor = sectionConfig.style.bgStyle === "primary" || sectionConfig.style.bgStyle === "gradient"
    ? "#FFFFFF"
    : sectionConfig.style.bgStyle === "dark" ? colors.text : colors.text;

  const cardTextColor = cards.style === "glass" || sectionConfig.style.bgStyle === "dark"
    ? colors.text : colors.text;

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
          Prizes
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {prizes.map((prize, i) => (
            <Grid size={{ xs: 12, md: cols }} key={i}>
              <Card elevation={cards.style === "shadow" ? 2 : 0} sx={getCardStyles(i)}>
                <CardContent sx={{ p: 4 }}>
                  <TrophyIcon sx={{ fontSize: 48, color: colors.primary, mb: 2 }} />
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: typography.headingWeight,
                      fontFamily: getFontStack(typography.headingFont),
                      color: cardTextColor,
                      mb: 1,
                    }}
                  >
                    {prize.title}
                  </Typography>
                  {prize.value && (
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 800, color: colors.primary, mb: 1 }}
                    >
                      {prize.value}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: sectionConfig.style.bgStyle === "dark" ? colors.textSecondary : colors.textSecondary,
                      fontFamily: getFontStack(typography.bodyFont),
                    }}
                  >
                    {prize.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
