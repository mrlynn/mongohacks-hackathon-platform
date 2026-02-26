import mongoose, { Schema, Document } from "mongoose";

export interface INotificationPreferences {
  emailNotifications: boolean;
  eventReminders: boolean;
  teamInvites: boolean;
  projectUpdates: boolean;
  newsletter: boolean;
}

export interface IUser extends Document {
  email: string;
  name: string;
  passwordHash?: string;
  needsPasswordSetup: boolean;
  magicLinkToken?: string;
  magicLinkExpiry?: Date;
  twoFactorEnabled: boolean;
  twoFactorCode?: string;
  twoFactorExpiry?: Date;
  notificationPreferences: INotificationPreferences;
  role: "super_admin" | "admin" | "organizer" | "judge" | "participant";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    passwordHash: { type: String },
    needsPasswordSetup: { type: Boolean, default: false },
    magicLinkToken: { type: String, select: false },
    magicLinkExpiry: { type: Date, select: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorCode: { type: String, select: false },
    twoFactorExpiry: { type: Date, select: false },
    notificationPreferences: {
      emailNotifications: { type: Boolean, default: true },
      eventReminders: { type: Boolean, default: true },
      teamInvites: { type: Boolean, default: true },
      projectUpdates: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false },
    },
    role: {
      type: String,
      enum: ["super_admin", "admin", "organizer", "judge", "participant"],
      default: "participant",
    },
  },
  { timestamps: true }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true }); // Critical: email lookups on login/registration
UserSchema.index({ magicLinkToken: 1 }, { sparse: true });

export const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
