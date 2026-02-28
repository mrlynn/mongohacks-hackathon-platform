import { connectToDatabase } from '@/lib/db/connection';
import { AtlasClusterModel, IAtlasCluster } from '@/lib/db/models/AtlasCluster';
import { EventModel } from '@/lib/db/models/Event';
import * as atlas from './atlas-client';
import { generateSecurePassword, generateAtlasProjectName } from './utils';

/**
 * Appends the devrel appName to a MongoDB connection string for attribution tracking.
 * 
 * Format: devrel-MEDIUM-PRIMARY-SECONDARY
 * - MEDIUM: platform
 * - PRIMARY: hackathon
 * - SECONDARY: atlas
 * 
 * See: /docs/Best_Practice_App_Name.md
 */
function addAppNameToConnectionString(connectionString: string): string {
  if (!connectionString) return connectionString;
  const appName = 'devrel-platform-hackathon-atlas';
  const separator = connectionString.includes('?') ? '&' : '?';
  return `${connectionString}${separator}appName=${appName}`;
}


export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export interface ProvisionClusterParams {
  eventId: string;
  teamId: string;
  projectId: string;
  userId: string;
  provider?: 'AWS' | 'GCP' | 'AZURE';
  region?: string;
}

export interface ProvisionedCluster extends IAtlasCluster {
  _initialCredentials?: {
    username: string;
    password: string;
  };
}

/**
 * Provision a new M0 Atlas cluster for a team.
 * 
 * Flow:
 * 1. Validate event has provisioning enabled
 * 2. Check for existing cluster (idempotency)
 * 3. Create Atlas project
 * 4. Create M0 cluster
 * 5. Create initial database user
 * 6. Configure IP access list
 * 7. Save to platform database
 * 
 * On failure, attempts rollback (delete Atlas project).
 */
export async function provisionCluster(
  params: ProvisionClusterParams
): Promise<ProvisionedCluster> {
  await connectToDatabase();

  // 1. Validate event has provisioning enabled
  const event = await EventModel.findById(params.eventId);
  if (!event?.atlasProvisioning?.enabled) {
    throw new Error('Atlas cluster provisioning is not enabled for this event');
  }

  // 2. Check for existing cluster (idempotency)
  const existing = await AtlasClusterModel.findOne({
    eventId: params.eventId,
    teamId: params.teamId,
    status: { $nin: ['deleted', 'error'] },
  });
  if (existing) {
    throw new ConflictError('A cluster already exists for this team in this event');
  }

  // 3. Resolve provider/region
  const provider = params.provider || event.atlasProvisioning.defaultProvider || 'AWS';
  const region = params.region || event.atlasProvisioning.defaultRegion || 'US_EAST_1';

  // 4. Generate names
  const projectName = generateAtlasProjectName(params.eventId, params.teamId);
  const clusterName = 'hackathon-cluster';

  let atlasProject: atlas.AtlasProject | null = null;

  try {
    // 5. Create Atlas project
    console.log(`[Atlas] Creating project: ${projectName}`);
    atlasProject = await atlas.createAtlasProject(projectName);

    // 6. Create M0 cluster
    console.log(`[Atlas] Creating M0 cluster in project ${atlasProject.id}`);
    const clusterResponse = await atlas.createM0Cluster(atlasProject.id, {
      name: clusterName,
      backingProvider: provider,
      region,
    });

    // 7. Generate initial database user
    const shortTeamId = params.teamId.slice(-6);
    const dbUsername = `team-${shortTeamId}`;
    const dbPassword = generateSecurePassword();

    console.log(`[Atlas] Creating database user: ${dbUsername}`);
    await atlas.createAtlasDatabaseUser(atlasProject.id, {
      username: dbUsername,
      password: dbPassword,
      clusterName,
    });

    // 8. Configure IP access
    const ipEntries = event.atlasProvisioning.openNetworkAccess
      ? [{ cidrBlock: '0.0.0.0/0', comment: 'Hackathon open access' }]
      : [];

    if (ipEntries.length > 0) {
      console.log(`[Atlas] Adding IP access list`);
      await atlas.addIpAccessListEntries(atlasProject.id, ipEntries);
    }

    // 9. Save to platform database
    const clusterDoc = await AtlasClusterModel.create({
      eventId: params.eventId,
      teamId: params.teamId,
      projectId: params.projectId,
      provisionedBy: params.userId,
      atlasProjectId: atlasProject.id,
      atlasProjectName: projectName,
      atlasClusterName: clusterName,
      atlasClusterId: clusterResponse.id || '',
      connectionString: addAppNameToConnectionString(clusterResponse.connectionStrings?.standardSrv || ''),
      standardConnectionString: addAppNameToConnectionString(clusterResponse.connectionStrings?.standard || ''),
      databaseUsers: [
        {
          username: dbUsername,
          createdAt: new Date(),
          createdBy: params.userId,
        },
      ],
      ipAccessList: ipEntries.map((e) => ({
        cidrBlock: e.cidrBlock,
        comment: e.comment || '',
        addedAt: new Date(),
        addedBy: params.userId,
      })),
      status: 'creating',
      providerName: provider,
      regionName: region,
    });

    console.log(`[Atlas] Cluster provisioning initiated: ${clusterDoc._id}`);

    // Return the document with the initial password (only time it's available)
    return {
      ...clusterDoc.toObject(),
      _initialCredentials: {
        username: dbUsername,
        password: dbPassword,
      },
    } as ProvisionedCluster;
  } catch (error) {
    console.error('[Atlas] Provisioning failed:', error);

    // Rollback: attempt to delete the Atlas project if cluster creation failed
    if (atlasProject?.id) {
      try {
        console.log(`[Atlas] Rolling back: deleting project ${atlasProject.id}`);
        await atlas.deleteAtlasProject(atlasProject.id);
      } catch (rollbackError) {
        console.error('[Atlas] Rollback failed:', rollbackError);
      }
    }
    throw error;
  }
}

/**
 * Delete an Atlas cluster and its project.
 */
export async function deleteCluster(clusterId: string): Promise<void> {
  await connectToDatabase();

  const cluster = await AtlasClusterModel.findById(clusterId);
  if (!cluster) {
    throw new Error('Cluster not found');
  }

  if (cluster.status === 'deleted') {
    return; // Already deleted
  }

  try {
    // Mark as deleting
    cluster.status = 'deleting';
    await cluster.save();

    // Delete from Atlas (cluster deletion also happens when project is deleted)
    console.log(`[Atlas] Deleting project ${cluster.atlasProjectId}`);
    await atlas.deleteAtlasProject(cluster.atlasProjectId);

    // Mark as deleted
    cluster.status = 'deleted';
    cluster.deletedAt = new Date();
    await cluster.save();

    console.log(`[Atlas] Cluster deleted: ${clusterId}`);
  } catch (error) {
    cluster.status = 'error';
    cluster.errorMessage = `Deletion failed: ${(error as Error).message}`;
    await cluster.save();
    throw error;
  }
}
