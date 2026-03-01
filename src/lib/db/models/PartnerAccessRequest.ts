import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPartnerAccessRequest extends Document {
  userId: Types.ObjectId;
  partnerId?: Types.ObjectId;
  newPartnerDetails?: {
    companyName: string;
    description: string;
    website?: string;
    industry: string;
    tier?: string;
  };
  requestedEventIds: Types.ObjectId[];
  status: "pending" | "approved" | "denied";
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PartnerAccessRequestSchema = new Schema<IPartnerAccessRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    partnerId: { type: Schema.Types.ObjectId, ref: "Partner" },
    newPartnerDetails: {
      companyName: { type: String },
      description: { type: String },
      website: { type: String },
      industry: { type: String },
      tier: { type: String },
    },
    requestedEventIds: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    status: {
      type: String,
      enum: ["pending", "approved", "denied"],
      default: "pending",
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewNotes: { type: String },
  },
  { timestamps: true }
);

PartnerAccessRequestSchema.index({ status: 1 });
PartnerAccessRequestSchema.index({ userId: 1 });
PartnerAccessRequestSchema.index({ partnerId: 1 }, { sparse: true });

export const PartnerAccessRequestModel =
  mongoose.models.PartnerAccessRequest ||
  mongoose.model<IPartnerAccessRequest>("PartnerAccessRequest", PartnerAccessRequestSchema);
