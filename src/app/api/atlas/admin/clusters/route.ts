import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/connection';
import { AtlasClusterModel } from '@/lib/db/models/AtlasCluster';
import { errorResponse } from '@/lib/utils';

/**
 * GET /api/atlas/admin/clusters?eventId={eventId}&status={status}
 * Admin overview: list all clusters with filtering.
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

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');

    await connectToDatabase();

    const query: Record<string, unknown> = {};
    if (eventId) query.eventId = eventId;
    if (status) query.status = status;

    const clusters = await AtlasClusterModel.find(query)
      .populate('eventId', 'name status')
      .populate('teamId', 'name')
      .populate('projectId', 'name')
      .populate('provisionedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Aggregate stats
    const stats = {
      total: clusters.length,
      byStatus: clusters.reduce(
        (acc, c) => {
          acc[c.status] = (acc[c.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };

    return NextResponse.json({
      success: true,
      clusters,
      stats,
    });
  } catch (error) {
    console.error('[API] Admin cluster list failed:', error);
    return errorResponse(
      `Failed to list clusters: ${(error as Error).message}`,
      500
    );
  }
}
