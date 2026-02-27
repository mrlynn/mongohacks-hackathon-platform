import mongoose, { Schema, Document, Types } from "mongoose";

export interface IScore extends Document {
  projectId: Types.ObjectId;
  eventId: Types.ObjectId;
  judgeId: Types.ObjectId;
  scores: Record<string, number>;
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
    scores: { type: Schema.Types.Mixed, required: true },
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

// Pre-save hook to calculate total score from all criteria
ScoreSchema.pre<IScore>("save", function () {
  if (this.scores && typeof this.scores === "object") {
    this.totalScore = Object.values(this.scores).reduce(
      (sum: number, val: unknown) =>
        sum + (typeof val === "number" ? val : 0),
      0
    );
  }
});

export const ScoreModel =
  mongoose.models.Score || mongoose.model<IScore>("Score", ScoreSchema);
