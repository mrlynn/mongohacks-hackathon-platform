import mongoose, { Schema, Document, Types } from "mongoose";

export interface IParticipant extends Document {
  userId: Types.ObjectId;
  email: string;
  name: string;
  bio: string;
  skills: string[];
  interests: string[];
  experience_level: "beginner" | "intermediate" | "advanced";
  skillsEmbedding?: number[];
  pastProjects: string[];
  invitedToEvents: Types.ObjectId[];
  registeredEvents: {
    eventId: Types.ObjectId;
    registrationDate: Date;
    status: "registered" | "attended" | "no_show";
  }[];
  customResponses: Map<string, unknown>;
  teamId: Types.ObjectId | null;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    bio: { type: String, default: "" },
    skills: [{ type: String }],
    interests: [{ type: String }],
    experience_level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    skillsEmbedding: { type: [Number], select: false },
    pastProjects: [{ type: String }],
    invitedToEvents: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    registeredEvents: [
      {
        eventId: { type: Schema.Types.ObjectId, ref: "Event" },
        registrationDate: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["registered", "attended", "no_show"],
          default: "registered",
        },
      },
    ],
    customResponses: { type: Map, of: Schema.Types.Mixed, default: new Map() },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", default: null },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Email index already created by unique: true in schema
// Indexes
ParticipantSchema.index({ userId: 1 }); // Critical: user to participant lookups
ParticipantSchema.index({ "registeredEvents.eventId": 1 });
ParticipantSchema.index({ teamId: 1, "registeredEvents.eventId": 1 }); // Team member queries
ParticipantSchema.index({ skills: 1 });

export const ParticipantModel =
  mongoose.models.Participant ||
  mongoose.model<IParticipant>("Participant", ParticipantSchema);
