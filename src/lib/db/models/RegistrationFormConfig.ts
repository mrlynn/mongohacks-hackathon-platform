import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICustomQuestion {
  id: string;
  label: string;
  type: "text" | "select" | "multiselect" | "checkbox";
  options: string[];
  required: boolean;
  placeholder: string;
}

export interface IRegistrationFormConfig extends Document {
  name: string;
  slug: string;
  description: string;
  isBuiltIn: boolean;
  createdBy?: Types.ObjectId;

  tier1: {
    showExperienceLevel: boolean;
    customQuestions: ICustomQuestion[];
  };

  tier2: {
    enabled: boolean;
    prompt: string;
    showSkills: boolean;
    showGithub: boolean;
    showBio: boolean;
    customQuestions: ICustomQuestion[];
  };

  tier3: {
    enabled: boolean;
    prompt: string;
    customQuestions: ICustomQuestion[];
  };

  createdAt: Date;
  updatedAt: Date;
}

const CustomQuestionSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "select", "multiselect", "checkbox"],
      required: true,
    },
    options: [{ type: String }],
    required: { type: Boolean, default: false },
    placeholder: { type: String, default: "" },
  },
  { _id: false }
);

const RegistrationFormConfigSchema = new Schema<IRegistrationFormConfig>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    isBuiltIn: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },

    tier1: {
      showExperienceLevel: { type: Boolean, default: true },
      customQuestions: [CustomQuestionSchema],
    },

    tier2: {
      enabled: { type: Boolean, default: true },
      prompt: {
        type: String,
        default: "Help us match you with a great team",
      },
      showSkills: { type: Boolean, default: true },
      showGithub: { type: Boolean, default: true },
      showBio: { type: Boolean, default: true },
      customQuestions: [CustomQuestionSchema],
    },

    tier3: {
      enabled: { type: Boolean, default: false },
      prompt: {
        type: String,
        default: "A few more questions from the organizers",
      },
      customQuestions: [CustomQuestionSchema],
    },
  },
  { timestamps: true }
);

RegistrationFormConfigSchema.index({ isBuiltIn: 1 });

export const RegistrationFormConfigModel =
  mongoose.models.RegistrationFormConfig ||
  mongoose.model<IRegistrationFormConfig>(
    "RegistrationFormConfig",
    RegistrationFormConfigSchema
  );
