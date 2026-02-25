import mongoose, { Schema, Document, Types } from "mongoose";

export interface IScore extends Document {
  projectId: Types.ObjectId;
  eventId: Types.ObjectId;
  judgeId: Types.ObjectId;
  scores: {
    innovation: number; // 1-10
    technical: number; // 1-10
    impact: number; // 1-10
    presentation: number; // 1-10
  };
  totalScore: number; // Auto-calculated
  comments: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ScoreSchema = new Schema<IScore>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    judgeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scores: {
      innovation: { type: Number, min: 1, max: 10, required: true },
      technical: { type: Number, min: 1, max: 10, required: true },
      impact: { type: Number, min: 1, max: 10, required: true },
      presentation: { type: Number, min: 1, max: 10, required: true },
    },
    totalScore: { type: Number },
    comments: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes
ScoreSchema.index({ projectId: 1, judgeId: 1 }, { unique: true }); // One score per judge per project
ScoreSchema.index({ eventId: 1 });
ScoreSchema.index({ judgeId: 1 });

// Pre-save hook to calculate total score
ScoreSchema.pre<IScore>("save", function () {
  if (this.scores) {
    this.totalScore =
      this.scores.innovation +
      this.scores.technical +
      this.scores.impact +
      this.scores.presentation;
  }
});

export const ScoreModel =
  mongoose.models.Score || mongoose.model<IScore>("Score", ScoreSchema);
