"use client";

import { Box } from "@mui/material";
import { ITemplateConfig } from "@/lib/db/models/TemplateConfig";
import { TemplateRenderProps, getTemplateCSSVars, getFontStack } from "@/lib/types/template";
import HeroSection from "./sections/HeroSection";
import AboutSection from "./sections/AboutSection";
import PrizesSection from "./sections/PrizesSection";
import ScheduleSection from "./sections/ScheduleSection";
import SponsorsSection from "./sections/SponsorsSection";
import PartnersSection from "./sections/PartnersSection";
import FaqSection from "./sections/FaqSection";
import CtaSection from "./sections/CtaSection";

const sectionComponents: Record<string, React.ComponentType<{
  config: ITemplateConfig;
  sectionConfig: ITemplateConfig["sections"][number];
  event: TemplateRenderProps["event"];
}>> = {
  hero: HeroSection,
  about: AboutSection,
  prizes: PrizesSection,
  schedule: ScheduleSection,
  sponsors: SponsorsSection,
  partners: PartnersSection,
  faq: FaqSection,
  cta: CtaSection,
};

export default function DynamicTemplate({ config, event }: TemplateRenderProps) {
  const cssVars = getTemplateCSSVars(config.colors);
  const enabledSections = config.sections.filter((s) => s.enabled);

  return (
    <Box
      sx={{
        ...cssVars,
        bgcolor: config.colors.background,
        color: config.colors.text,
        fontFamily: getFontStack(config.typography.bodyFont),
        minHeight: "100vh",
      }}
    >
      {enabledSections.map((sectionConfig, index) => {
        const Component = sectionComponents[sectionConfig.type];
        if (!Component) return null;

        return (
          <Component
            key={`${sectionConfig.type}-${index}`}
            config={config}
            sectionConfig={sectionConfig}
            event={event}
          />
        );
      })}
    </Box>
  );
}
