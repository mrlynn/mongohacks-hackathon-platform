import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITemplateColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  heroBg: string;
  heroBgEnd: string;
  heroText: string;
  buttonBg: string;
  buttonText: string;
}

export interface ITemplateTypography {
  headingFont: "system" | "serif" | "mono";
  bodyFont: "system" | "serif" | "mono";
  headingWeight: 600 | 700 | 800 | 900;
  scale: "compact" | "default" | "large";
}

export interface ITemplateSectionConfig {
  type: "hero" | "about" | "prizes" | "schedule" | "sponsors" | "partners" | "faq" | "cta";
  enabled: boolean;
  layout: string;
  style: {
    bgStyle: "light" | "dark" | "primary" | "gradient";
    spacing: "compact" | "default" | "spacious";
  };
}

export interface ITemplateCards {
  borderRadius: 0 | 8 | 12 | 16;
  style: "shadow" | "border" | "flat" | "glass";
  accentPosition: "top" | "left" | "none";
}

export interface ITemplateHero {
  style: "gradient" | "solid" | "image-overlay" | "light";
  gradientDirection: string;
  overlayOpacity: number;
  buttonStyle: "rounded" | "pill" | "square";
}

export interface ITemplateConfig extends Document {
  name: string;
  slug: string;
  description: string;
  baseTemplate: string;
  isBuiltIn: boolean;
  colors: ITemplateColors;
  typography: ITemplateTypography;
  sections: ITemplateSectionConfig[];
  cards: ITemplateCards;
  hero: ITemplateHero;
  createdBy?: Types.ObjectId;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateConfigSchema = new Schema<ITemplateConfig>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    baseTemplate: { type: String, default: "" },
    isBuiltIn: { type: Boolean, default: false },

    colors: {
      primary: { type: String, default: "#00684A" },
      secondary: { type: String, default: "#13AA52" },
      background: { type: String, default: "#FFFFFF" },
      surface: { type: String, default: "#F9FBFA" },
      text: { type: String, default: "#001E2B" },
      textSecondary: { type: String, default: "#5C6C75" },
      heroBg: { type: String, default: "#00684A" },
      heroBgEnd: { type: String, default: "#004D37" },
      heroText: { type: String, default: "#FFFFFF" },
      buttonBg: { type: String, default: "#FFFFFF" },
      buttonText: { type: String, default: "#00684A" },
    },

    typography: {
      headingFont: {
        type: String,
        enum: ["system", "serif", "mono"],
        default: "system",
      },
      bodyFont: {
        type: String,
        enum: ["system", "serif", "mono"],
        default: "system",
      },
      headingWeight: {
        type: Number,
        enum: [600, 700, 800, 900],
        default: 700,
      },
      scale: {
        type: String,
        enum: ["compact", "default", "large"],
        default: "default",
      },
    },

    sections: [
      {
        type: {
          type: String,
          enum: ["hero", "about", "prizes", "schedule", "sponsors", "partners", "faq", "cta"],
          required: true,
        },
        enabled: { type: Boolean, default: true },
        layout: { type: String, default: "default" },
        style: {
          bgStyle: {
            type: String,
            enum: ["light", "dark", "primary", "gradient"],
            default: "light",
          },
          spacing: {
            type: String,
            enum: ["compact", "default", "spacious"],
            default: "default",
          },
        },
      },
    ],

    cards: {
      borderRadius: {
        type: Number,
        enum: [0, 8, 12, 16],
        default: 12,
      },
      style: {
        type: String,
        enum: ["shadow", "border", "flat", "glass"],
        default: "shadow",
      },
      accentPosition: {
        type: String,
        enum: ["top", "left", "none"],
        default: "none",
      },
    },

    hero: {
      style: {
        type: String,
        enum: ["gradient", "solid", "image-overlay", "light"],
        default: "gradient",
      },
      gradientDirection: { type: String, default: "135deg" },
      overlayOpacity: { type: Number, default: 0.85, min: 0, max: 1 },
      buttonStyle: {
        type: String,
        enum: ["rounded", "pill", "square"],
        default: "rounded",
      },
    },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TemplateConfigSchema.index({ isBuiltIn: 1 });
TemplateConfigSchema.index({ isDefault: 1 });

export const TemplateConfigModel =
  mongoose.models.TemplateConfig ||
  mongoose.model<ITemplateConfig>("TemplateConfig", TemplateConfigSchema);
