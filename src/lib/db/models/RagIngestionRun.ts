import mongoose, { Schema, Document } from "mongoose";
import type { IRagIngestionRun } from "@/lib/rag/types";

export interface IRagIngestionRunDoc
  extends Omit<IRagIngestionRun, "_id">,
    Document {}

const RagIngestionRunSchema = new Schema<IRagIngestionRunDoc>(
  {
    runId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["running", "completed", "failed", "cancelled"],
      default: "running",
    },
    stats: {
      filesProcessed: { type: Number, default: 0 },
      filesSkipped: { type: Number, default: 0 },
      chunksCreated: { type: Number, default: 0 },
      chunksDeleted: { type: Number, default: 0 },
      embeddingsGenerated: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
      errors: [
        {
          file: { type: String },
          error: { type: String },
        },
      ],
    },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date, default: null },
    durationMs: { type: Number, default: null },
    triggeredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes
RagIngestionRunSchema.index({ status: 1 });
RagIngestionRunSchema.index({ startedAt: -1 });

export const RagIngestionRunModel =
  mongoose.models.RagIngestionRun ||
  mongoose.model<IRagIngestionRunDoc>(
    "RagIngestionRun",
    RagIngestionRunSchema
  );
