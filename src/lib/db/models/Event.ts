import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEvent extends Document {
  name: string;
  description: string;
  theme: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  submissionDeadline?: Date;
  location: string;
  city?: string;
  country?: string;
  coordinates?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  venue?: string;
  capacity: number;
  isVirtual: boolean;
  tags: string[];
  rules: string;
  judging_criteria: string[];
  judgingRubric?: {
    name: string;
    description: string;
    weight: number;
    maxScore: number;
  }[];
  organizers: Types.ObjectId[];
  partners: Types.ObjectId[]; // Partner references
  status: "draft" | "open" | "in_progress" | "concluded";
  resultsPublished: boolean;
  resultsPublishedAt?: Date;
  feedbackForms?: {
    participant?: Types.ObjectId;
    partner?: Types.ObjectId;
  };
  descriptionEmbedding?: number[];
  landingPage?: {
    template: string;
    slug: string; // URL slug (e.g., "mongodb-hackathon-2024")
    published: boolean;
    registrationFormConfig?: Types.ObjectId;
    customContent: {
      hero?: {
        headline?: string;
        subheadline?: string;
        ctaText?: string;
        backgroundImage?: string;
      };
      about?: string;
      prizes?: Array<{ title: string; description: string; value?: string }>;
      schedule?: Array<{ time: string; title: string; description?: string }>;
      sponsors?: Array<{ name: string; logo: string; tier: string }>;
      faq?: Array<{ question: string; answer: string }>;
    };
  };
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
    submissionDeadline: { type: Date },
  atlasProvisioning?: {
    enabled: boolean;
    defaultProvider: 'AWS' | 'GCP' | 'AZURE';
    defaultRegion: string;
    openNetworkAccess: boolean; // 0.0.0.0/0
    maxDbUsersPerCluster: number;
    autoCleanupOnEventEnd: boolean;
    allowedProviders: Array<'AWS' | 'GCP' | 'AZURE'>;
    allowedRegions: string[];
  };
    location: { type: String, required: true },
    city: { type: String },
    country: { type: String },
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
    },
    venue: { type: String },
    capacity: { type: Number, required: true },
    isVirtual: { type: Boolean, default: false },
    tags: [{ type: String }],
    rules: { type: String, default: "" },
    judging_criteria: [{ type: String }],
    judgingRubric: [
      {
        name: { type: String, required: true },
        description: { type: String, default: "" },
        weight: { type: Number, default: 1 },
        maxScore: { type: Number, default: 10 },
      },
    ],
    organizers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    partners: [{ type: Schema.Types.ObjectId, ref: "Partner" }],
    status: {
      type: String,
      enum: ["draft", "open", "in_progress", "concluded"],
      default: "draft",
    },
    resultsPublished: { type: Boolean, default: false },
    resultsPublishedAt: { type: Date },
    feedbackForms: {
      participant: {
        type: Schema.Types.ObjectId,
        ref: "FeedbackFormConfig",
      },
      partner: {
        type: Schema.Types.ObjectId,
        ref: "FeedbackFormConfig",
      },
    },
    descriptionEmbedding: { type: [Number], select: false },
    landingPage: {
      template: {
        type: String,
        default: "modern",
      },
      slug: { type: String, unique: true, sparse: true }, // Unique URL slug
      published: { type: Boolean, default: false },
      registrationFormConfig: {
        type: Schema.Types.ObjectId,
        ref: "RegistrationFormConfig",
      },
      customContent: {
        hero: {
          headline: String,
          subheadline: String,
          ctaText: String,
          backgroundImage: String,
        },
        about: String,
        prizes: [
          {
            title: String,
            description: String,
            value: String,
          },
        ],
        schedule: [
          {
            time: String,
            title: String,
            description: String,
          },
        ],
        sponsors: [
          {
            name: String,
    atlasProvisioning: {
      enabled: { type: Boolean, default: false },
      defaultProvider: { type: String, enum: ['AWS', 'GCP', 'AZURE'], default: 'AWS' },
      defaultRegion: { type: String, default: 'US_EAST_1' },
      openNetworkAccess: { type: Boolean, default: true },  // 0.0.0.0/0
      maxDbUsersPerCluster: { type: Number, default: 5 },
      autoCleanupOnEventEnd: { type: Boolean, default: true },
      allowedProviders: [{ type: String, enum: ['AWS', 'GCP', 'AZURE'] }],
      allowedRegions: [{ type: String }],
    },
            logo: String,
            tier: String,
          },
        ],
        faq: [
          {
            question: String,
            answer: String,
          },
        ],
      },
    },
  },
  { timestamps: true }
);

// Indexes
EventSchema.index({ status: 1 });
EventSchema.index({ startDate: 1 });
EventSchema.index({ tags: 1 });
EventSchema.index({ coordinates: "2dsphere" }); // Geospatial index for map queries
EventSchema.index({ country: 1, city: 1 });
// Index removed - already created by unique: true on landingPage.slug field
EventSchema.index({ "landingPage.published": 1 });

export const EventModel =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
