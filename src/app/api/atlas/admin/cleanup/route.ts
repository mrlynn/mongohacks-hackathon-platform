import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { errorResponse } from '@/lib/utils';
import {
  cleanupEventClusters,
  runScheduledCleanup,
  findEventsNeedingCleanup,
} from '@/lib/atlas/cleanup-service';

/**
 * POST /api/atlas/admin/cleanup
 * Manually trigger cluster cleanup for concluded events.
 * 
 * Body (optional):
 * - eventId: string - cleanup specific event
 * - dryRun: boolean - preview without deleting
 * 
 * If no eventId provided, runs cleanup for all concluded events.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    // Require admin role
    if (!['admin', 'super_admin'].includes((session.user as any).role)) {
      return errorResponse('Admin access required', 403);
    }

    const body = await req.json().catch(() => ({}));
    const { eventId, dryRun } = body;

    if (dryRun) {
      // Preview mode: show what would be cleaned up
      const eventIds = eventId
        ? [eventId]
        : await findEventsNeedingCleanup();

      return NextResponse.json({
        success: true,
        dryRun: true,
        eventsToCleanup: eventIds.length,
        eventIds,
      });
    }

    // Execute cleanup
    let reports;
    if (eventId) {
      // Cleanup specific event
      const report = await cleanupEventClusters(eventId);
      reports = [report];
    } else {
      // Cleanup all concluded events
      reports = await runScheduledCleanup();
    }

    // Calculate totals
    const totals = reports.reduce(
      (acc, r) => ({
        clustersFound: acc.clustersFound + r.clustersFound,
        clustersDeleted: acc.clustersDeleted + r.clustersDeleted,
        errors: acc.errors + r.errors.length,
      }),
      { clustersFound: 0, clustersDeleted: 0, errors: 0 }
    );

    return NextResponse.json({
      success: true,
      eventsProcessed: reports.length,
      totals,
      reports,
    });
  } catch (error) {
    console.error('[API] Cleanup failed:', error);
    return errorResponse(
      `Cleanup failed: ${(error as Error).message}`,
      500
    );
  }
}

/**
 * GET /api/atlas/admin/cleanup
 * Preview events that need cleanup (dry run).
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    // Require admin role
    if (!['admin', 'super_admin'].includes((session.user as any).role)) {
      return errorResponse('Admin access required', 403);
    }

    const eventIds = await findEventsNeedingCleanup();

    return NextResponse.json({
      success: true,
      eventsNeedingCleanup: eventIds.length,
      eventIds,
    });
  } catch (error) {
    console.error('[API] Cleanup preview failed:', error);
    return errorResponse(
      `Failed to preview cleanup: ${(error as Error).message}`,
      500
    );
  }
}
