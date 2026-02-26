import mongoose, { Schema, Document } from "mongoose";

export interface ISiteSettings extends Document {
  key: string; // singleton: always "global"
  heroBackground: string | null; // filename from /public/backgrounds/, or null for default
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    key: { type: String, default: "global", unique: true },
    heroBackground: { type: String, default: null },
  },
  { timestamps: true }
);

export const SiteSettingsModel =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
