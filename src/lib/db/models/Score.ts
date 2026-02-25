import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProjectScore extends Document {
  projectId: Types.ObjectId;
  judgeId: Types.ObjectId;
  rubricId: Types.ObjectId;
  scores: {
    criteriaId: string;
    score: number;
    feedback: string;
  }[];
  aiGeneratedSummary: string;
  overallComments: string;
  overallScore: number;
  submittedAt: Date;
}

const ProjectScoreSchema = new Schema<IProjectScore>({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  judgeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rubricId: {
    type: Schema.Types.ObjectId,
    ref: "JudgingRubric",
    required: true,
  },
  scores: [
    {
      criteriaId: { type: String, required: true },
      score: { type: Number, required: true },
      feedback: { type: String, default: "" },
    },
  ],
  aiGeneratedSummary: { type: String, default: "" },
  overallComments: { type: String, default: "" },
  overallScore: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
});

ProjectScoreSchema.index({ projectId: 1, judgeId: 1 }, { unique: true });

export const ProjectScoreModel =
  mongoose.models.ProjectScore ||
  mongoose.model<IProjectScore>("ProjectScore", ProjectScoreSchema);
