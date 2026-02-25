"use client";

import { Box, Container, Typography, Grid, Card, CardContent, Chip } from "@mui/material";
import { SectionRenderProps, getFontStack, getSpacingMultiplier, getSectionBgStyle } from "@/lib/types/template";

export default function SponsorsSection({ config, sectionConfig, event }: SectionRenderProps) {
  const { colors, typography, cards } = config;
  const sponsors = event.landingPage?.customContent?.sponsors;
  if (!sponsors?.length) return null;

  const spacingMul = getSpacingMultiplier(sectionConfig.style.spacing);
  const bg = getSectionBgStyle(sectionConfig.style.bgStyle, colors, 4);

  const textColor = sectionConfig.style.bgStyle === "primary" || sectionConfig.style.bgStyle === "gradient"
    ? "#FFFFFF" : bg.color;

  const tierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "gold": return "#FFB302";
      case "silver": return "#B8C4C2";
      case "bronze": return "#CD7F32";
      default: return colors.primary;
    }
  };

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
          Sponsors
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {sponsors.map((sponsor, i) => (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={i}>
              <Card
                elevation={cards.style === "shadow" ? 2 : 0}
                sx={{
                  borderRadius: `${cards.borderRadius}px`,
                  textAlign: "center",
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": { transform: "translateY(-4px)" },
                  ...(cards.style === "border" ? {
                    border: `1px solid ${sectionConfig.style.bgStyle === "dark" ? `${colors.primary}20` : "#E7EEEC"}`,
                    boxShadow: "none",
                    bgcolor: sectionConfig.style.bgStyle === "dark" ? `${colors.primary}08` : colors.background,
                  } : {}),
                  ...(cards.style === "glass" ? {
                    bgcolor: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(12px)",
                    border: `1px solid ${colors.primary}20`,
                    boxShadow: "none",
                  } : {}),
                  ...(cards.style === "flat" ? {
                    boxShadow: "none",
                    bgcolor: sectionConfig.style.bgStyle === "dark" ? `${colors.primary}08` : colors.surface,
                  } : {}),
                  ...(cards.accentPosition === "top" ? { borderTop: `3px solid ${tierColor(sponsor.tier)}` } : {}),
                  ...(cards.accentPosition === "left" ? { borderLeft: `4px solid ${tierColor(sponsor.tier)}` } : {}),
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {sponsor.logo && (
                    <Box
                      component="img"
                      src={sponsor.logo}
                      alt={sponsor.name}
                      sx={{
                        height: 48,
                        maxWidth: "100%",
                        objectFit: "contain",
                        mb: 2,
                        filter: sectionConfig.style.bgStyle === "dark" ? "brightness(0) invert(1)" : "none",
                      }}
                    />
                  )}
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      fontFamily: getFontStack(typography.headingFont),
                      color: sectionConfig.style.bgStyle === "dark" ? colors.text : colors.text,
                    }}
                  >
                    {sponsor.name}
                  </Typography>
                  <Chip
                    label={sponsor.tier}
                    size="small"
                    sx={{
                      mt: 1,
                      bgcolor: `${tierColor(sponsor.tier)}20`,
                      color: tierColor(sponsor.tier),
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
