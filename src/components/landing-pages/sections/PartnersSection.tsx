"use client";

import { Box, Container, Typography, Grid, Card, CardContent, Chip, Link as MuiLink } from "@mui/material";
import { EmojiEvents as TrophyIcon, OpenInNew as OpenInNewIcon } from "@mui/icons-material";
import { SectionRenderProps, getFontStack, getSpacingMultiplier, getSectionBgStyle, LandingPagePartner } from "@/lib/types/template";

const TIER_ORDER: LandingPagePartner["tier"][] = ["platinum", "gold", "silver", "bronze", "community"];

const tierColor = (tier: string) => {
  switch (tier.toLowerCase()) {
    case "platinum": return "#7B68EE";
    case "gold": return "#FFB302";
    case "silver": return "#B8C4C2";
    case "bronze": return "#CD7F32";
    default: return "#13AA52";
  }
};

export default function PartnersSection({ config, sectionConfig, event }: SectionRenderProps) {
  const { colors, typography, cards } = config;
  const partners = event.partners;
  const partnerPrizes = event.partnerPrizes;

  if (!partners?.length) return null;

  const spacingMul = getSpacingMultiplier(sectionConfig.style.spacing);
  const bg = getSectionBgStyle(sectionConfig.style.bgStyle, colors, 4);
  const isDark = sectionConfig.style.bgStyle === "dark" || sectionConfig.style.bgStyle === "primary" || sectionConfig.style.bgStyle === "gradient";
  const textColor = isDark ? "#FFFFFF" : bg.color;

  // Sort partners by tier order
  const sortedPartners = [...partners].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)
  );

  const getCardStyles = () => {
    const base: Record<string, unknown> = {
      borderRadius: `${cards.borderRadius}px`,
      height: "100%",
      textAlign: "center",
      transition: "all 0.3s ease",
      "&:hover": { transform: "translateY(-4px)" },
    };

    switch (cards.style) {
      case "border":
        base.border = `1px solid ${isDark ? `${colors.primary}20` : "#E7EEEC"}`;
        base.boxShadow = "none";
        base.bgcolor = isDark ? `${colors.primary}08` : colors.background;
        break;
      case "glass":
        base.bgcolor = "rgba(255,255,255,0.05)";
        base.backdropFilter = "blur(12px)";
        base.border = `1px solid ${colors.primary}20`;
        base.boxShadow = "none";
        break;
      case "flat":
        base.boxShadow = "none";
        base.bgcolor = isDark ? `${colors.primary}08` : colors.surface;
        break;
      case "shadow":
      default:
        base.bgcolor = isDark ? colors.surface : colors.background;
        break;
    }

    return base;
  };

  const cardTextColor = isDark ? colors.text : colors.text;

  return (
    <Box sx={{ ...bg, py: { xs: 6 * spacingMul, md: 10 * spacingMul } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          sx={{
            fontWeight: typography.headingWeight,
            fontFamily: getFontStack(typography.headingFont),
            color: textColor,
            mb: 2,
            textAlign: "center",
          }}
        >
          Partners
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: isDark ? "rgba(255,255,255,0.7)" : colors.textSecondary,
            fontFamily: getFontStack(typography.bodyFont),
            mb: 6,
            textAlign: "center",
            maxWidth: 600,
            mx: "auto",
          }}
        >
          Made possible by our amazing partners
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {sortedPartners.map((partner, i) => (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={partner._id || i}>
              <Card
                elevation={cards.style === "shadow" ? 2 : 0}
                sx={{
                  ...getCardStyles(),
                  ...(cards.accentPosition === "top" ? { borderTop: `3px solid ${tierColor(partner.tier)}` } : {}),
                  ...(cards.accentPosition === "left" ? { borderLeft: `4px solid ${tierColor(partner.tier)}` } : {}),
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {partner.logo && (
                    <Box
                      component="img"
                      src={partner.logo}
                      alt={partner.name}
                      sx={{
                        height: 48,
                        maxWidth: "100%",
                        objectFit: "contain",
                        mb: 2,
                        filter: isDark ? "brightness(0) invert(1)" : "none",
                      }}
                    />
                  )}
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      fontFamily: getFontStack(typography.headingFont),
                      color: cardTextColor,
                    }}
                  >
                    {partner.name}
                  </Typography>
                  {partner.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: isDark ? colors.textSecondary : colors.textSecondary,
                        fontFamily: getFontStack(typography.bodyFont),
                        mt: 0.5,
                        mb: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {partner.description}
                    </Typography>
                  )}
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "center", alignItems: "center", mt: 1 }}>
                    <Chip
                      label={partner.tier}
                      size="small"
                      sx={{
                        bgcolor: `${tierColor(partner.tier)}20`,
                        color: tierColor(partner.tier),
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    />
                  </Box>
                  {partner.website && (
                    <MuiLink
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        mt: 1.5,
                        fontSize: "0.75rem",
                        color: colors.primary,
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Visit website
                      <OpenInNewIcon sx={{ fontSize: 14 }} />
                    </MuiLink>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Partner Prizes subsection */}
        {partnerPrizes && partnerPrizes.length > 0 && (
          <Box sx={{ mt: 8 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: typography.headingWeight,
                fontFamily: getFontStack(typography.headingFont),
                color: textColor,
                mb: 4,
                textAlign: "center",
              }}
            >
              Partner Prizes
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              {partnerPrizes.map((prize, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                  <Card
                    elevation={cards.style === "shadow" ? 2 : 0}
                    sx={{
                      ...getCardStyles(),
                      ...(cards.accentPosition === "top" ? { borderTop: `3px solid ${colors.primary}` } : {}),
                      ...(cards.accentPosition === "left" ? { borderLeft: `4px solid ${colors.primary}` } : {}),
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <TrophyIcon sx={{ fontSize: 36, color: colors.primary, mb: 1.5 }} />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: typography.headingWeight,
                          fontFamily: getFontStack(typography.headingFont),
                          color: cardTextColor,
                          mb: 0.5,
                        }}
                      >
                        {prize.title}
                      </Typography>
                      {prize.value && (
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: 800, color: colors.primary, mb: 1 }}
                        >
                          {prize.value}
                        </Typography>
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          color: isDark ? colors.textSecondary : colors.textSecondary,
                          fontFamily: getFontStack(typography.bodyFont),
                          mb: 1.5,
                        }}
                      >
                        {prize.description}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                        {prize.partnerLogo && (
                          <Box
                            component="img"
                            src={prize.partnerLogo}
                            alt={prize.partnerName}
                            sx={{
                              height: 20,
                              objectFit: "contain",
                              filter: isDark ? "brightness(0) invert(1)" : "none",
                            }}
                          />
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            color: isDark ? "rgba(255,255,255,0.6)" : colors.textSecondary,
                            fontFamily: getFontStack(typography.bodyFont),
                          }}
                        >
                          Sponsored by {prize.partnerName}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
}
