import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { AtlasClusterModel } from '@/lib/db/models/AtlasCluster';
import { requireTeamMember } from '@/lib/atlas/auth-guard';
import { refreshClusterStatus } from '@/lib/atlas/status-service';
import { errorResponse } from '@/lib/utils';

/**
 * GET /api/atlas/clusters/[clusterId]/status
 * Poll current cluster status from Atlas API.
 * Used during provisioning to detect when cluster becomes active.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clusterId: string }> }
) {
  try {
    const { clusterId } = await params;

    await connectToDatabase();
    const cluster = await AtlasClusterModel.findById(clusterId);

    if (!cluster) {
      return errorResponse('Cluster not found', 404);
    }

    // Require team membership to view
    await requireTeamMember(cluster.teamId.toString());

    // Refresh status from Atlas
    const status = await refreshClusterStatus(clusterId);

    return NextResponse.json({
      success: true,
      status,
      cluster: {
        id: cluster._id,
        status: cluster.status,
        connectionString: cluster.connectionString,
        lastStatusCheck: cluster.lastStatusCheck,
      },
    });
  } catch (error) {
    console.error('[API] Failed to refresh cluster status:', error);
    return errorResponse(
      `Failed to refresh status: ${(error as Error).message}`,
      500
    );
  }
}
