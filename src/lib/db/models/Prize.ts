import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPrize extends Document {
  eventId: Types.ObjectId;
  partnerId?: Types.ObjectId; // Optional - some prizes may not be partner-sponsored
  
  // Prize details
  title: string;
  description: string;
  category: "grand" | "track" | "sponsor" | "special" | "community";
  value?: string; // e.g., "$5,000" or "MacBook Pro"
  monetaryValue?: number; // Numeric value for sorting/analytics
  
  // Prize criteria
  eligibility?: string;
  criteria?: string[];
  
  // Winner tracking
  winners: Array<{
    projectId: Types.ObjectId;
    teamId: Types.ObjectId;
    awardedDate: Date;
    notes?: string;
  }>;
  
  // Metadata
  displayOrder: number;
  isActive: boolean;
  imageUrl?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const PrizeSchema = new Schema<IPrize>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    partnerId: { type: Schema.Types.ObjectId, ref: "Partner" },
    
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["grand", "track", "sponsor", "special", "community"],
      required: true,
    },
    value: { type: String },
    monetaryValue: { type: Number },
    
    eligibility: { type: String },
    criteria: [{ type: String }],
    
    winners: [
      {
        projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
        teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
        awardedDate: { type: Date, default: Date.now },
        notes: String,
      },
    ],
    
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

// Indexes
PrizeSchema.index({ eventId: 1, category: 1 });
PrizeSchema.index({ partnerId: 1 });
PrizeSchema.index({ eventId: 1, displayOrder: 1 });
PrizeSchema.index({ eventId: 1, isActive: 1 });
PrizeSchema.index({ "winners.projectId": 1 });
PrizeSchema.index({ "winners.teamId": 1 });

export const PrizeModel =
  mongoose.models.Prize || mongoose.model<IPrize>("Prize", PrizeSchema);
