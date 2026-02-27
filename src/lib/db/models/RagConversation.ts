import mongoose, { Schema, Document } from "mongoose";
import type { IRagConversation } from "@/lib/rag/types";

export interface IRagConversationDoc
  extends Omit<IRagConversation, "_id">,
    Document {}

const RagConversationSchema = new Schema<IRagConversationDoc>(
  {
    sessionId: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    messages: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        sources: [
          {
            title: { type: String },
            url: { type: String },
            section: { type: String },
            relevanceScore: { type: Number },
          },
        ],
        feedback: { type: String, enum: ["up", "down"] },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    metadata: {
      page: { type: String, default: "" },
      userAgent: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// Indexes
RagConversationSchema.index({ sessionId: 1 });
RagConversationSchema.index({ userId: 1 }, { sparse: true });
RagConversationSchema.index({ createdAt: -1 });

export const RagConversationModel =
  mongoose.models.RagConversation ||
  mongoose.model<IRagConversationDoc>(
    "RagConversation",
    RagConversationSchema
  );
