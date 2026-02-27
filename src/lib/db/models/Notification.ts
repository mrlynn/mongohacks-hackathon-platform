import mongoose, { Schema, Document, Types } from "mongoose";

export const NOTIFICATION_TYPES = [
  "registration_confirmed",
  "event_reminder",
  "team_member_joined",
  "team_member_left",
  "team_invite",
  "project_submitted",
  "registration_closed",
  "results_published",
  "judging_started",
  "judge_assigned",
  "score_received",
  "feedback_requested",
  "general",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedEvent?: Types.ObjectId;
  relatedTeam?: Types.ObjectId;
  relatedProject?: Types.ObjectId;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    relatedEvent: { type: Schema.Types.ObjectId, ref: "Event" },
    relatedTeam: { type: Schema.Types.ObjectId, ref: "Team" },
    relatedProject: { type: Schema.Types.ObjectId, ref: "Project" },
    actionUrl: { type: String },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // 90-day TTL

export const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
