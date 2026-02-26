import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITeamNote extends Document {
  teamId: Types.ObjectId;
  authorId: Types.ObjectId;
  content: string;
  parentNoteId?: Types.ObjectId;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TeamNoteSchema = new Schema<ITeamNote>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 2000 },
    parentNoteId: { type: Schema.Types.ObjectId, ref: "TeamNote", default: null },
    editedAt: { type: Date },
  },
  { timestamps: true }
);

TeamNoteSchema.index({ teamId: 1, createdAt: -1 });
TeamNoteSchema.index({ parentNoteId: 1 });

export const TeamNoteModel =
  mongoose.models.TeamNote ||
  mongoose.model<ITeamNote>("TeamNote", TeamNoteSchema);
