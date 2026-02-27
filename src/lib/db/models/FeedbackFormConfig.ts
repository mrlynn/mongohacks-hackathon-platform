import mongoose, { Schema, Document, Types } from "mongoose";

export interface IScaleConfig {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
}

export interface IFeedbackQuestion {
  id: string;
  type:
    | "short_text"
    | "long_text"
    | "multiple_choice"
    | "checkbox"
    | "linear_scale"
    | "rating";
  label: string;
  description: string;
  required: boolean;
  placeholder: string;
  options: string[];
  scaleConfig?: IScaleConfig;
}

export interface IFeedbackSection {
  id: string;
  title: string;
  description: string;
  questions: IFeedbackQuestion[];
}

export interface IFeedbackFormConfig extends Document {
  name: string;
  slug: string;
  description: string;
  isBuiltIn: boolean;
  createdBy?: Types.ObjectId;
  targetAudience: "participant" | "partner" | "both";
  sections: IFeedbackSection[];
  createdAt: Date;
  updatedAt: Date;
}

const ScaleConfigSchema = new Schema(
  {
    min: { type: Number, default: 1 },
    max: { type: Number, default: 5 },
    minLabel: { type: String, default: "" },
    maxLabel: { type: String, default: "" },
  },
  { _id: false }
);

const FeedbackQuestionSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "short_text",
        "long_text",
        "multiple_choice",
        "checkbox",
        "linear_scale",
        "rating",
      ],
      required: true,
    },
    label: { type: String, required: true },
    description: { type: String, default: "" },
    required: { type: Boolean, default: false },
    placeholder: { type: String, default: "" },
    options: [{ type: String }],
    scaleConfig: { type: ScaleConfigSchema },
  },
  { _id: false }
);

const FeedbackSectionSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    questions: [FeedbackQuestionSchema],
  },
  { _id: false }
);

const FeedbackFormConfigSchema = new Schema<IFeedbackFormConfig>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    isBuiltIn: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    targetAudience: {
      type: String,
      enum: ["participant", "partner", "both"],
      default: "participant",
    },
    sections: [FeedbackSectionSchema],
  },
  { timestamps: true }
);

FeedbackFormConfigSchema.index({ isBuiltIn: 1 });

export const FeedbackFormConfigModel =
  mongoose.models.FeedbackFormConfig ||
  mongoose.model<IFeedbackFormConfig>(
    "FeedbackFormConfig",
    FeedbackFormConfigSchema
  );
