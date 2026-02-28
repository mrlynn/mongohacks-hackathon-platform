import mongoose, { Schema, Document } from "mongoose";

export const AI_CATEGORIES = [
  "project_suggestions",
  "judge_feedback",
  "project_summaries",
  "skill_embeddings",
  "rag_chat",
  "rag_embeddings",
] as const;

export type AiCategory = (typeof AI_CATEGORIES)[number];

export const AI_PROVIDERS = ["openai", "voyage"] as const;
export type AiProvider = (typeof AI_PROVIDERS)[number];

export const AI_OPERATIONS = [
  "chat_completion",
  "embedding",
  "streaming",
  "builder_prompt_enhancement",
] as const;
export type AiOperation = (typeof AI_OPERATIONS)[number];

export interface IAiUsageLog extends Omit<Document, 'model'> {
  category: AiCategory;
  provider: AiProvider;
  model: string;
  operation: AiOperation;
  tokensUsed: number;
  promptTokens?: number;
  completionTokens?: number;
  estimatedCost: number;
  durationMs: number;
  userId?: mongoose.Types.ObjectId;
  eventId?: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
  error: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AiUsageLogSchema = new Schema<IAiUsageLog>(
  {
    category: {
      type: String,
      enum: AI_CATEGORIES,
      required: true,
    },
    provider: {
      type: String,
      enum: AI_PROVIDERS,
      required: true,
    },
    model: { type: String, required: true },
    operation: {
      type: String,
      enum: AI_OPERATIONS,
      required: true,
    },
    tokensUsed: { type: Number, required: true, default: 0 },
    promptTokens: { type: Number },
    completionTokens: { type: Number },
    estimatedCost: { type: Number, required: true, default: 0 },
    durationMs: { type: Number, required: true, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    eventId: { type: Schema.Types.ObjectId, ref: "Event" },
    metadata: { type: Schema.Types.Mixed },
    error: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AiUsageLogSchema.index({ category: 1, createdAt: -1 });
AiUsageLogSchema.index({ createdAt: -1 });
AiUsageLogSchema.index({ userId: 1 });

export const AiUsageLogModel =
  mongoose.models.AiUsageLog ||
  mongoose.model<IAiUsageLog>("AiUsageLog", AiUsageLogSchema);
