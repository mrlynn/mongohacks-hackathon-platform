import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPartner extends Document {
  name: string;
  description: string;
  logo?: string;
  website?: string;
  industry: string;
  tier: "platinum" | "gold" | "silver" | "bronze" | "community";
  status: "active" | "inactive" | "pending";
  
  // Company details
  companyInfo: {
    size?: "startup" | "small" | "medium" | "large" | "enterprise";
    headquarters?: string;
    foundedYear?: number;
    employeeCount?: string;
  };
  
  // Contact information
  contacts: Array<{
    name: string;
    email: string;
    phone?: string;
    role: string;
    isPrimary: boolean;
  }>;
  
  // Engagement tracking
  engagement: {
    eventsParticipated: Types.ObjectId[]; // Reference to Event IDs
    prizesOffered: Types.ObjectId[]; // Reference to Prize IDs
    totalContribution?: number; // Financial contribution (optional)
    engagementLevel?: "low" | "medium" | "high";
    lastEngagementDate?: Date;
  };
  
  // Social links
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    youtube?: string;
  };
  
  // Additional metadata
  tags: string[];
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const PartnerSchema = new Schema<IPartner>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    logo: { type: String },
    website: { type: String },
    industry: { type: String, required: true },
    tier: {
      type: String,
      enum: ["platinum", "gold", "silver", "bronze", "community"],
      default: "bronze",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
    },
    
    companyInfo: {
      size: {
        type: String,
        enum: ["startup", "small", "medium", "large", "enterprise"],
      },
      headquarters: String,
      foundedYear: Number,
      employeeCount: String,
    },
    
    contacts: [
      {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: String,
        role: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    
    engagement: {
      eventsParticipated: [{ type: Schema.Types.ObjectId, ref: "Event" }],
      prizesOffered: [{ type: Schema.Types.ObjectId, ref: "Prize" }],
      totalContribution: Number,
      engagementLevel: {
        type: String,
        enum: ["low", "medium", "high"],
      },
      lastEngagementDate: Date,
    },
    
    social: {
      linkedin: String,
      twitter: String,
      github: String,
      youtube: String,
    },
    
    tags: [{ type: String }],
    notes: { type: String },
  },
  { timestamps: true }
);

// Indexes
// Index removed - already created by unique: true on name field
PartnerSchema.index({ tier: 1, status: 1 });
PartnerSchema.index({ industry: 1 });
PartnerSchema.index({ status: 1 });
PartnerSchema.index({ "engagement.engagementLevel": 1 });
PartnerSchema.index({ "contacts.email": 1 });
PartnerSchema.index({ tags: 1 });

export const PartnerModel =
  mongoose.models.Partner ||
  mongoose.model<IPartner>("Partner", PartnerSchema);
