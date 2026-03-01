import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEmailTemplateVariable {
  name: string;
  required: boolean;
  description: string;
  example: string;
}

export interface IEmailTemplate extends Document {
  key: string;
  name: string;
  category: "auth" | "event" | "partner" | "notification";
  description: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  variables: IEmailTemplateVariable[];
  isBuiltIn: boolean;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmailTemplateSchema = new Schema<IEmailTemplate>(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["auth", "event", "partner", "notification"],
      required: true,
    },
    description: { type: String, default: "" },
    subject: { type: String, required: true },
    htmlBody: { type: String, required: true },
    textBody: { type: String, required: true },
    variables: [
      {
        name: { type: String, required: true },
        required: { type: Boolean, default: true },
        description: { type: String, default: "" },
        example: { type: String, default: "" },
      },
    ],
    isBuiltIn: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

EmailTemplateSchema.index({ key: 1 }, { unique: true });
EmailTemplateSchema.index({ category: 1 });

export const EmailTemplateModel =
  mongoose.models.EmailTemplate ||
  mongoose.model<IEmailTemplate>("EmailTemplate", EmailTemplateSchema);
