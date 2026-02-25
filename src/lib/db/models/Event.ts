import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEvent extends Document {
  name: string;
  description: string;
  theme: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  location: string;
  capacity: number;
  isVirtual: boolean;
  tags: string[];
  rules: string;
  judging_criteria: string[];
  organizers: Types.ObjectId[];
  status: "draft" | "open" | "in_progress" | "concluded";
  descriptionEmbedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    theme: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    isVirtual: { type: Boolean, default: false },
    tags: [{ type: String }],
    rules: { type: String, default: "" },
    judging_criteria: [{ type: String }],
    organizers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["draft", "open", "in_progress", "concluded"],
      default: "draft",
    },
    descriptionEmbedding: { type: [Number], select: false },
  },
  { timestamps: true }
);

EventSchema.index({ status: 1 });
EventSchema.index({ startDate: 1 });
EventSchema.index({ tags: 1 });

export const EventModel =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
