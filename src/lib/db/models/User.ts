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
  role: "super_admin" | "admin" | "organizer" | "marketer" | "mentor" | "judge" | "participant";
  // GitHub OAuth fields
  githubUsername?: string;
  bio?: string;
  company?: string;
  location?: string;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
  banned?: boolean;
  bannedAt?: Date;
  bannedReason?: string;
  deletedAt?: Date;
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
      enum: ["super_admin", "admin", "organizer", "marketer", "mentor", "judge", "participant"],
      default: "participant",
    },
    // GitHub OAuth fields
    githubUsername: { type: String },
    bio: { type: String },
    company: { type: String },
    location: { type: String },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpiry: { type: Date, select: false },
    banned: { type: Boolean, default: false },
    bannedAt: { type: Date },
    bannedReason: { type: String },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true }); // Critical: email lookups on login/registration
UserSchema.index({ magicLinkToken: 1 }, { sparse: true });
UserSchema.index({ emailVerificationToken: 1 }, { sparse: true });
UserSchema.index({ banned: 1 });
UserSchema.index({ deletedAt: 1 });

export const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
