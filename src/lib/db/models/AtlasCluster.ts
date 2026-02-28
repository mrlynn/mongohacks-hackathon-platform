import { Schema, model, models, Document, Types } from 'mongoose';

export interface IAtlasCluster extends Document {
  eventId: Types.ObjectId;
  teamId: Types.ObjectId;
  projectId: Types.ObjectId;       // MongoHacks project (from Project model)
  provisionedBy: Types.ObjectId;   // User who provisioned (team leader)

  // Atlas identifiers
  atlasProjectId: string;          // Atlas project groupId (24-hex)
  atlasProjectName: string;        // e.g., "mh-abc123-def456"
  atlasClusterName: string;        // e.g., "hackathon-cluster"
  atlasClusterId: string;          // Atlas cluster ID

  // Connection details
  connectionString: string;        // SRV connection string
  standardConnectionString: string;// Standard connection string

  // Database users created for this cluster
  databaseUsers: {
    username: string;
    createdAt: Date;
    createdBy: Types.ObjectId;
  }[];

  // IP access list entries
  ipAccessList: {
    cidrBlock: string;
    comment: string;
    addedAt: Date;
    addedBy: Types.ObjectId;
  }[];

  // Cluster state
  status: 'creating' | 'idle' | 'active' | 'deleting' | 'deleted' | 'error';
  providerName: 'AWS' | 'GCP' | 'AZURE';
  regionName: string;              // e.g., "US_EAST_1"
  mongoDBVersion: string;

  // Metadata
  errorMessage?: string;
  lastStatusCheck: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const AtlasClusterSchema = new Schema<IAtlasCluster>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    provisionedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    atlasProjectId: { type: String, required: true, unique: true },
    atlasProjectName: { type: String, required: true },
    atlasClusterName: { type: String, required: true },
    atlasClusterId: { type: String, default: '' },

    connectionString: { type: String, default: '' },
    standardConnectionString: { type: String, default: '' },

    databaseUsers: [
      {
        username: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      },
    ],

    ipAccessList: [
      {
        cidrBlock: { type: String, required: true },
        comment: { type: String, default: '' },
        addedAt: { type: Date, default: Date.now },
        addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      },
    ],

    status: {
      type: String,
      enum: ['creating', 'idle', 'active', 'deleting', 'deleted', 'error'],
      default: 'creating',
    },
    providerName: { type: String, enum: ['AWS', 'GCP', 'AZURE'], default: 'AWS' },
    regionName: { type: String, default: 'US_EAST_1' },
    mongoDBVersion: { type: String, default: '' },

    errorMessage: { type: String },
    lastStatusCheck: { type: Date, default: Date.now },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// One cluster per team per event
AtlasClusterSchema.index({ eventId: 1, teamId: 1 }, { unique: true });
// Lookup by Atlas project
AtlasClusterSchema.index({ atlasProjectId: 1 });
// Admin dashboard: list active clusters by event
AtlasClusterSchema.index({ eventId: 1, status: 1 });

export const AtlasClusterModel =
  models.AtlasCluster || model<IAtlasCluster>('AtlasCluster', AtlasClusterSchema);
