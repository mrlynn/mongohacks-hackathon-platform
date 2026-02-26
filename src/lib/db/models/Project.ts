import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProject extends Document {
  eventId: Types.ObjectId;
  teamId: Types.ObjectId;
  name: string;
  description: string;
  descriptionEmbedding?: number[];
  aiSummary?: string;
  aiFeedback?: string;
  category: string;
  technologies: string[];
  repoUrl: string;
  demoUrl?: string;
  documentationUrl?: string;
  submissionDate: Date;
  lastModified: Date;
  status: "draft" | "submitted" | "under_review" | "judged";
  innovations: string;
  teamMembers: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    descriptionEmbedding: { type: [Number], select: false },
    aiSummary: { type: String },
    aiFeedback: { type: String },
    category: { type: String, required: true },
    technologies: [{ type: String }],
    repoUrl: { type: String, required: true },
    demoUrl: { type: String },
    documentationUrl: { type: String },
    submissionDate: { type: Date },
    lastModified: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["draft", "submitted", "under_review", "judged"],
      default: "draft",
    },
    innovations: { type: String, default: "" },
    teamMembers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

ProjectSchema.index({ eventId: 1, status: 1 });
ProjectSchema.index({ teamId: 1 });

export const ProjectModel =
  mongoose.models.Project ||
  mongoose.model<IProject>("Project", ProjectSchema);
