import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  passwordHash: string;
  role: "admin" | "organizer" | "judge" | "participant";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "organizer", "judge", "participant"],
      default: "participant",
    },
  },
  { timestamps: true }
);

export const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
