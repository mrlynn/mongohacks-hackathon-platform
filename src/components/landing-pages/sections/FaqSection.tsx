"use client";

import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { SectionRenderProps, getFontStack, getSpacingMultiplier, getSectionBgStyle } from "@/lib/types/template";

export default function FaqSection({ config, sectionConfig, event }: SectionRenderProps) {
  const { colors, typography, cards } = config;
  const faq = event.landingPage?.customContent?.faq;
  if (!faq?.length) return null;

  const spacingMul = getSpacingMultiplier(sectionConfig.style.spacing);
  const bg = getSectionBgStyle(sectionConfig.style.bgStyle, colors, 5);

  const textColor = sectionConfig.style.bgStyle === "primary" || sectionConfig.style.bgStyle === "gradient"
    ? "#FFFFFF" : bg.color;

  const isDark = sectionConfig.style.bgStyle === "dark";

  return (
    <Box sx={{ ...bg, py: { xs: 6 * spacingMul, md: 10 * spacingMul } }}>
      <Container maxWidth="md">
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
          FAQ
        </Typography>

        {faq.map((item, i) => (
          <Accordion
            key={i}
            elevation={cards.style === "shadow" ? 1 : 0}
            sx={{
              mb: 2,
              borderRadius: `${cards.borderRadius}px !important`,
              overflow: "hidden",
              "&:before": { display: "none" },
              ...(isDark ? {
                bgcolor: `${colors.primary}08`,
                border: `1px solid ${colors.primary}20`,
              } : cards.style === "border" ? {
                border: `1px solid #E7EEEC`,
                boxShadow: "none",
              } : cards.style === "glass" ? {
                bgcolor: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${colors.primary}15`,
                boxShadow: "none",
              } : {}),
              ...(cards.accentPosition === "left" ? {
                borderLeft: `4px solid ${colors.primary}`,
              } : {}),
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: isDark ? colors.text : colors.text }} />}
              sx={{ py: 1 }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  fontFamily: getFontStack(typography.headingFont),
                  color: isDark ? colors.text : colors.text,
                }}
              >
                {item.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: getFontStack(typography.bodyFont),
                  color: isDark ? colors.textSecondary : colors.textSecondary,
                  lineHeight: 1.8,
                }}
              >
                {item.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
}
