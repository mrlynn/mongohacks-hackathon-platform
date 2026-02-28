import { connectToDatabase } from '@/lib/db/connection';
import { AtlasClusterModel } from '@/lib/db/models/AtlasCluster';
import * as atlas from './atlas-client';
import { mapAtlasStateToPlatformStatus, addAppNameToConnectionString } from './utils';

export interface ClusterStatus {
  atlasState: string;
  platformStatus: string;
  connectionString: string;
  mongoDBVersion: string;
}

/**
 * Poll the Atlas Admin API for the current cluster status and update local record.
 * Used during provisioning to detect when the cluster becomes IDLE/active.
 */
export async function refreshClusterStatus(clusterId: string): Promise<ClusterStatus> {
  await connectToDatabase();

  const cluster = await AtlasClusterModel.findById(clusterId);
  if (!cluster) {
    throw new Error('Cluster not found');
  }

  if (cluster.status === 'deleted') {
    return {
      atlasState: 'DELETED',
      platformStatus: 'deleted',
      connectionString: '',
      mongoDBVersion: '',
    };
  }

  try {
    // Query Atlas for current state
    const atlasCluster = await atlas.getAtlasCluster(
      cluster.atlasProjectId,
      cluster.atlasClusterName
    );

    // Map Atlas state to platform status
    const platformStatus = mapAtlasStateToPlatformStatus(atlasCluster.stateName);

    // Update local record — preserve appName attribution on connection strings
    cluster.status = platformStatus;
    cluster.connectionString = addAppNameToConnectionString(
      atlasCluster.connectionStrings?.standardSrv || cluster.connectionString
    );
    cluster.standardConnectionString = addAppNameToConnectionString(
      atlasCluster.connectionStrings?.standard || cluster.standardConnectionString
    );
    cluster.mongoDBVersion = atlasCluster.mongoDBVersion || '';
    cluster.lastStatusCheck = new Date();
    await cluster.save();

    console.log(`[Atlas] Status refreshed for ${clusterId}: ${atlasCluster.stateName} → ${platformStatus}`);

    return {
      atlasState: atlasCluster.stateName,
      platformStatus,
      connectionString: cluster.connectionString,
      mongoDBVersion: cluster.mongoDBVersion,
    };
  } catch (error) {
    console.error(`[Atlas] Failed to refresh status for ${clusterId}:`, error);
    
    cluster.status = 'error';
    cluster.errorMessage = `Status check failed: ${(error as Error).message}`;
    cluster.lastStatusCheck = new Date();
    await cluster.save();

    throw error;
  }
}
