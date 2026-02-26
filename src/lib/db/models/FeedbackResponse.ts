import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFeedbackResponse extends Document {
  formId: Types.ObjectId;
  eventId: Types.ObjectId;
  respondentEmail: string;
  respondentName: string;
  respondentType: "participant" | "partner";
  userId?: Types.ObjectId;
  answers: Map<string, unknown>;
  startedAt?: Date;
  submittedAt: Date;
  completionTimeMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackResponseSchema = new Schema<IFeedbackResponse>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: "FeedbackFormConfig",
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    respondentEmail: { type: String, required: true },
    respondentName: { type: String, required: true },
    respondentType: {
      type: String,
      enum: ["participant", "partner"],
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    answers: {
      type: Map,
      of: Schema.Types.Mixed,
      default: new Map(),
    },
    startedAt: { type: Date },
    submittedAt: { type: Date, default: Date.now },
    completionTimeMinutes: { type: Number },
  },
  { timestamps: true }
);

FeedbackResponseSchema.index({ eventId: 1 });
FeedbackResponseSchema.index({ formId: 1, eventId: 1 });
FeedbackResponseSchema.index(
  { formId: 1, eventId: 1, respondentEmail: 1 },
  { unique: true }
);

export const FeedbackResponseModel =
  mongoose.models.FeedbackResponse ||
  mongoose.model<IFeedbackResponse>(
    "FeedbackResponse",
    FeedbackResponseSchema
  );
