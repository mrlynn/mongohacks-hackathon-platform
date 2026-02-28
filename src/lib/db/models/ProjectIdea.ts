import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IProjectIdea extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  
  inputs: {
    teamSize: number;
    skillLevels: Array<'beginner' | 'intermediate' | 'advanced'>;
    teamComposition: string[]; // Frontend, Backend, Design, etc.
    preferredLanguages: string[];
    preferredFrameworks: string[];
    preferredDatabases: string[];
    sponsorProducts: string[];
    interestAreas: string[];
    timeCommitment: number; // hours
    complexityPreference: 'simple' | 'moderate' | 'ambitious';
    targetPrizes: string[];
  };
  
  idea: {
    name: string;
    tagline: string;
    problemStatement: string;
    solution: string;
    techStack: {
      frontend: string[];
      backend: string[];
      database: string[];
      apis: string[];
      deployment: string[];
    };
    timeline: {
      phase: string;
      hours: string;
      tasks: string[];
    }[];
    difficulty: 1 | 2 | 3 | 4 | 5;
    prizeCategories: string[];
    differentiator: string;
    implementationGuide: string; // Markdown
  };
  
  saved: boolean;
  shared: boolean;
  teamVotes: {
    userId: mongoose.Types.ObjectId;
    vote: 'up' | 'down';
    comment?: string;
    createdAt: Date;
  }[];
  
  generatedAt: Date;
  model: string; // e.g., "gpt-4o"
  tokensUsed: number;
}

const ProjectIdeaSchema = new Schema<IProjectIdea>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    inputs: {
      teamSize: { type: Number, required: true },
      skillLevels: [{ type: String, enum: ['beginner', 'intermediate', 'advanced'] }],
      teamComposition: [String],
      preferredLanguages: [String],
      preferredFrameworks: [String],
      preferredDatabases: [String],
      sponsorProducts: [{ type: String, index: true }],
      interestAreas: [String],
      timeCommitment: { type: Number, required: true },
      complexityPreference: {
        type: String,
        enum: ['simple', 'moderate', 'ambitious'],
        required: true,
      },
      targetPrizes: [String],
    },
    idea: {
      name: { type: String, required: true },
      tagline: { type: String, required: true },
      problemStatement: { type: String, required: true },
      solution: { type: String, required: true },
      techStack: {
        frontend: [String],
        backend: [String],
        database: [String],
        apis: [String],
        deployment: [String],
      },
      timeline: [
        {
          phase: String,
          hours: String,
          tasks: [String],
        },
      ],
      difficulty: { type: Number, min: 1, max: 5, required: true },
      prizeCategories: [String],
      differentiator: String,
      implementationGuide: String,
    },
    saved: { type: Boolean, default: false, index: true },
    shared: { type: Boolean, default: false },
    teamVotes: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        vote: { type: String, enum: ['up', 'down'] },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    generatedAt: { type: Date, default: Date.now, index: true },
    model: { type: String, default: 'gpt-4o' },
    tokensUsed: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
ProjectIdeaSchema.index({ userId: 1, eventId: 1 });
ProjectIdeaSchema.index({ eventId: 1, saved: 1 });
ProjectIdeaSchema.index({ 'inputs.preferredLanguages': 1 });

export const ProjectIdeaModel =
  models.ProjectIdea || model<IProjectIdea>('ProjectIdea', ProjectIdeaSchema);
