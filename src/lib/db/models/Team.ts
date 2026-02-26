import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITeam extends Document {
  name: string;
  eventId: Types.ObjectId;
  members: Types.ObjectId[];
  leaderId: Types.ObjectId;
  description?: string;
  lookingForMembers: boolean;
  desiredSkills?: string[];
  desiredSkillsEmbedding?: number[];
  maxMembers: number;
  status: "forming" | "active" | "inactive";
  // Communication
  communicationPlatform?: "discord" | "slack" | "other";
  discordChannelUrl?: string;
  slackChannelUrl?: string;
  otherCommunicationUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    leaderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String },
    lookingForMembers: { type: Boolean, default: true },
    desiredSkills: [{ type: String }],
    desiredSkillsEmbedding: { type: [Number], select: false },
    maxMembers: { type: Number, default: 5 },
    status: {
      type: String,
      enum: ["forming", "active", "inactive"],
      default: "forming",
    },
    // Communication
    communicationPlatform: {
      type: String,
      enum: ["discord", "slack", "other"],
    },
    discordChannelUrl: { type: String },
    slackChannelUrl: { type: String },
    otherCommunicationUrl: { type: String },
  },
  { timestamps: true }
);

// Indexes
TeamSchema.index({ eventId: 1 });
TeamSchema.index({ leaderId: 1 });
TeamSchema.index({ members: 1 });
TeamSchema.index({ lookingForMembers: 1, eventId: 1 });

export const TeamModel =
  mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);
