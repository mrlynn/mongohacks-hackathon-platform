import mongoose, { Schema, Document } from "mongoose";
import type { IRagDocument } from "@/lib/rag/types";

export interface IRagDocumentDoc extends Omit<IRagDocument, "_id">, Document {}

const RagDocumentSchema = new Schema<IRagDocumentDoc>(
  {
    content: { type: String, required: true },
    contentHash: { type: String, required: true },
    accessLevel: {
      type: String,
      enum: ["public", "authenticated"],
      default: "authenticated",
    },
    source: {
      filePath: { type: String, required: true },
      title: { type: String, required: true },
      section: { type: String, required: true },
      category: { type: String, required: true },
      url: { type: String, required: true },
      type: {
        type: String,
        enum: ["docs", "event", "project", "platform"],
        default: "docs",
      },
    },
    chunk: {
      index: { type: Number, required: true },
      totalChunks: { type: Number, required: true },
      tokens: { type: Number, required: true },
    },
    embedding: { type: [Number], select: false },
    ingestion: {
      runId: { type: String, required: true },
      ingestedAt: { type: Date, required: true },
      ingestedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      version: { type: Number, default: 1 },
    },
  },
  { timestamps: true }
);

// Indexes
RagDocumentSchema.index({ "source.filePath": 1, "chunk.index": 1 });
RagDocumentSchema.index({ "source.category": 1 });
RagDocumentSchema.index({ "source.type": 1 });
RagDocumentSchema.index({ contentHash: 1 });
RagDocumentSchema.index({ "ingestion.runId": 1 });
RagDocumentSchema.index({ accessLevel: 1 });

export const RagDocumentModel =
  mongoose.models.RagDocument ||
  mongoose.model<IRagDocumentDoc>("RagDocument", RagDocumentSchema);
