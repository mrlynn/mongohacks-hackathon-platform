import { connectToDatabase } from '@/lib/db/connection';
import { EventModel } from '@/lib/db/models/Event';
import { AtlasClusterModel } from '@/lib/db/models/AtlasCluster';
import { deleteCluster } from './provisioning-service';

export interface CleanupReport {
  eventId: string;
  eventName: string;
  clustersFound: number;
  clustersDeleted: number;
  errors: Array<{ clusterId: string; error: string }>;
}

/**
 * Clean up all Atlas clusters for a specific event.
 * Called when an event concludes and autoCleanupOnEventEnd is enabled.
 */
export async function cleanupEventClusters(eventId: string): Promise<CleanupReport> {
  await connectToDatabase();

  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  if (!event.atlasProvisioning?.autoCleanupOnEventEnd) {
    console.log(`[Atlas Cleanup] Event ${eventId} has auto-cleanup disabled, skipping`);
    return {
      eventId,
      eventName: event.name,
      clustersFound: 0,
      clustersDeleted: 0,
      errors: [],
    };
  }

  // Find all active clusters for this event
  const clusters = await AtlasClusterModel.find({
    eventId,
    status: { $nin: ['deleted', 'deleting'] },
  });

  const report: CleanupReport = {
    eventId,
    eventName: event.name,
    clustersFound: clusters.length,
    clustersDeleted: 0,
    errors: [],
  };

  console.log(
    `[Atlas Cleanup] Event "${event.name}" concluded, cleaning up ${clusters.length} clusters`
  );

  // Delete each cluster
  for (const cluster of clusters) {
    try {
      await deleteCluster(cluster._id.toString());
      report.clustersDeleted++;
      console.log(`[Atlas Cleanup] Deleted cluster ${cluster._id} (${cluster.atlasClusterName})`);
    } catch (error) {
      const errorMsg = (error as Error).message;
      report.errors.push({
        clusterId: cluster._id.toString(),
        error: errorMsg,
      });
      console.error(
        `[Atlas Cleanup] Failed to delete cluster ${cluster._id}:`,
        errorMsg
      );
    }
  }

  console.log(
    `[Atlas Cleanup] Event "${event.name}" cleanup complete: ${report.clustersDeleted}/${report.clustersFound} deleted`
  );

  return report;
}

/**
 * Find all concluded events with pending cluster cleanup.
 * Returns events that have:
 * - status = 'concluded'
 * - atlasProvisioning.autoCleanupOnEventEnd = true
 * - active clusters still present
 */
export async function findEventsNeedingCleanup(): Promise<string[]> {
  await connectToDatabase();

  const concludedEvents = await EventModel.find({
    status: 'concluded',
    'atlasProvisioning.enabled': true,
    'atlasProvisioning.autoCleanupOnEventEnd': true,
  }).select('_id');

  const eventIds: string[] = [];

  for (const event of concludedEvents) {
    const activeClusters = await AtlasClusterModel.countDocuments({
      eventId: event._id,
      status: { $nin: ['deleted', 'deleting'] },
    });

    if (activeClusters > 0) {
      eventIds.push(event._id.toString());
    }
  }

  return eventIds;
}

/**
 * Run cleanup for all concluded events that need it.
 * Intended to be called by a cron job or scheduled task.
 */
export async function runScheduledCleanup(): Promise<CleanupReport[]> {
  const eventIds = await findEventsNeedingCleanup();

  if (eventIds.length === 0) {
    console.log('[Atlas Cleanup] No events need cleanup');
    return [];
  }

  console.log(`[Atlas Cleanup] Running cleanup for ${eventIds.length} concluded events`);

  const reports: CleanupReport[] = [];

  for (const eventId of eventIds) {
    try {
      const report = await cleanupEventClusters(eventId);
      reports.push(report);
    } catch (error) {
      console.error(`[Atlas Cleanup] Failed to cleanup event ${eventId}:`, error);
    }
  }

  return reports;
}
