import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { AtlasClusterModel } from '@/lib/db/models/AtlasCluster';
import { requireTeamMember, requireTeamLeader } from '@/lib/atlas/auth-guard';
import { deleteCluster } from '@/lib/atlas/provisioning-service';
import { errorResponse } from '@/lib/utils';

/**
 * GET /api/atlas/clusters/[clusterId]
 * Get cluster details (team members can view).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clusterId: string }> }
) {
  try {
    const { clusterId } = await params;

    await connectToDatabase();
    const cluster = await AtlasClusterModel.findById(clusterId)
      .populate('provisionedBy', 'name email')
      .lean();

    if (!cluster) {
      return errorResponse('Cluster not found', 404);
    }

    // Require team membership to view
    await requireTeamMember(cluster.teamId.toString());

    return NextResponse.json({
      success: true,
      cluster,
    });
  } catch (error) {
    console.error('[API] Failed to get cluster:', error);
    return errorResponse(`Failed to get cluster: ${(error as Error).message}`, 500);
  }
}

/**
 * DELETE /api/atlas/clusters/[clusterId]
 * Delete a cluster (team leader only).
 */
export async function DELETE(
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

    // Require team leader to delete
    await requireTeamLeader(cluster.teamId.toString());

    // Delete the cluster
    await deleteCluster(clusterId);

    return NextResponse.json({
      success: true,
      message: 'Cluster deletion initiated',
    });
  } catch (error) {
    console.error('[API] Failed to delete cluster:', error);
    return errorResponse(`Failed to delete cluster: ${(error as Error).message}`, 500);
  }
}
