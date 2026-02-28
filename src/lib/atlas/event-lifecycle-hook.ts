import { connectToDatabase } from '@/lib/db/connection';
import { EventModel } from '@/lib/db/models/Event';
import { cleanupEventClusters } from './cleanup-service';

/**
 * Hook to be called when an event status changes to 'concluded'.
 * Automatically triggers cluster cleanup if auto-cleanup is enabled.
 * 
 * This should be integrated into the event update workflow.
 * 
 * Usage:
 * ```typescript
 * // In your event update API/service:
 * if (oldStatus !== 'concluded' && newStatus === 'concluded') {
 *   await onEventConcluded(eventId);
 * }
 * ```
 */
export async function onEventConcluded(eventId: string): Promise<void> {
  await connectToDatabase();

  const event = await EventModel.findById(eventId);
  if (!event) {
    console.error(`[Event Lifecycle] Event ${eventId} not found`);
    return;
  }

  if (!event.atlasProvisioning?.enabled || !event.atlasProvisioning?.autoCleanupOnEventEnd) {
    console.log(
      `[Event Lifecycle] Event "${event.name}" concluded, but auto-cleanup is disabled`
    );
    return;
  }

  console.log(
    `[Event Lifecycle] Event "${event.name}" concluded, triggering cluster cleanup`
  );

  try {
    const report = await cleanupEventClusters(eventId);
    
    console.log(
      `[Event Lifecycle] Cleanup complete for event "${event.name}": ${report.clustersDeleted}/${report.clustersFound} clusters deleted`
    );

    if (report.errors.length > 0) {
      console.error(
        `[Event Lifecycle] Cleanup had ${report.errors.length} errors:`,
        report.errors
      );
    }
  } catch (error) {
    console.error(
      `[Event Lifecycle] Failed to cleanup clusters for event "${event.name}":`,
      error
    );
  }
}

/**
 * Example integration point for event update API.
 * Add this to your event PATCH/PUT handler.
 */
export async function handleEventStatusChange(
  eventId: string,
  oldStatus: string,
  newStatus: string
): Promise<void> {
  // Trigger cleanup when event transitions to concluded
  if (oldStatus !== 'concluded' && newStatus === 'concluded') {
    // Run cleanup in background (non-blocking)
    onEventConcluded(eventId).catch((error) => {
      console.error('[Event Lifecycle] Background cleanup failed:', error);
    });
  }
}
