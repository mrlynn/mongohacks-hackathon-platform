import mongoose, { Schema, Document, Types } from "mongoose";

export interface IJudgeAssignment extends Document {
  eventId: Types.ObjectId;
  judgeId: Types.ObjectId;
  projectId: Types.ObjectId;
  status: "pending" | "in_progress" | "completed";
  assignedAt: Date;
  assignedBy: Types.ObjectId; // Admin who made the assignment
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JudgeAssignmentSchema = new Schema<IJudgeAssignment>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    judgeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    assignedAt: { type: Date, default: Date.now },
    assignedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for efficient queries
JudgeAssignmentSchema.index({ eventId: 1, judgeId: 1 }); // All assignments for a judge in an event
JudgeAssignmentSchema.index({ projectId: 1, judgeId: 1 }, { unique: true }); // One assignment per judge per project
JudgeAssignmentSchema.index({ eventId: 1, status: 1 }); // Filter by status
JudgeAssignmentSchema.index({ judgeId: 1, status: 1 }); // Judge's pending work

export const JudgeAssignmentModel =
  mongoose.models.JudgeAssignment ||
  mongoose.model<IJudgeAssignment>("JudgeAssignment", JudgeAssignmentSchema);
