import { ITemplateConfig, ITemplateColors, ITemplateSectionConfig } from "@/lib/db/models/TemplateConfig";

export interface TemplateRenderProps {
  config: ITemplateConfig;
  event: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    landingPage?: {
      customContent?: {
        hero?: {
          headline?: string;
          subheadline?: string;
          ctaText?: string;
          backgroundImage?: string;
        };
        about?: string;
        prizes?: Array<{ title: string; description: string; value?: string }>;
        schedule?: Array<{ time: string; title: string; description?: string }>;
        sponsors?: Array<{ name: string; logo: string; tier: string }>;
        faq?: Array<{ question: string; answer: string }>;
      };
    };
  };
}

export interface SectionRenderProps {
  config: ITemplateConfig;
  sectionConfig: ITemplateSectionConfig;
  event: TemplateRenderProps["event"];
}

/**
 * Convert template color config to CSS custom properties
 */
export function getTemplateCSSVars(colors: ITemplateColors): Record<string, string> {
  return {
    "--t-primary": colors.primary,
    "--t-secondary": colors.secondary,
    "--t-background": colors.background,
    "--t-surface": colors.surface,
    "--t-text": colors.text,
    "--t-text-secondary": colors.textSecondary,
    "--t-hero-bg": colors.heroBg,
    "--t-hero-bg-end": colors.heroBgEnd,
    "--t-hero-text": colors.heroText,
    "--t-button-bg": colors.buttonBg,
    "--t-button-text": colors.buttonText,
  };
}

/**
 * Map font names to CSS font stacks
 */
export function getFontStack(font: "system" | "serif" | "mono"): string {
  switch (font) {
    case "serif":
      return "'Source Serif Pro', Georgia, serif";
    case "mono":
      return "'Source Code Pro', 'Courier New', monospace";
    case "system":
    default:
      return "'Euclid Circular A', 'Lexend Deca', Arial, sans-serif";
  }
}

/**
 * Get spacing multiplier based on scale
 */
export function getSpacingMultiplier(spacing: "compact" | "default" | "spacious"): number {
  switch (spacing) {
    case "compact": return 0.75;
    case "spacious": return 1.5;
    case "default":
    default: return 1;
  }
}

/**
 * Get section background style
 */
export function getSectionBgStyle(
  bgStyle: "light" | "dark" | "primary" | "gradient",
  colors: ITemplateColors,
  index: number
): { bgcolor: string; color: string } {
  switch (bgStyle) {
    case "dark":
      return { bgcolor: colors.background, color: colors.text };
    case "primary":
      return { bgcolor: colors.primary, color: "#FFFFFF" };
    case "gradient":
      return { bgcolor: colors.primary, color: "#FFFFFF" };
    case "light":
    default:
      return {
        bgcolor: index % 2 === 0 ? colors.background : colors.surface,
        color: colors.text,
      };
  }
}
