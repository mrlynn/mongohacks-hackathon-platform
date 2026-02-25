import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  passwordHash?: string;
  needsPasswordSetup: boolean;
  magicLinkToken?: string;
  magicLinkExpiry?: Date;
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
    role: {
      type: String,
      enum: ["super_admin", "admin", "organizer", "judge", "participant"],
      default: "participant",
    },
  },
  { timestamps: true }
);

UserSchema.index({ magicLinkToken: 1 }, { sparse: true });

export const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
