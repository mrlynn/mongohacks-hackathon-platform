import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
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

    // Handle corrupt records (missing teamId) — only admins can view
    if (!cluster.teamId) {
      const session = await auth();
      if (!session?.user?.id || !['admin', 'super_admin'].includes((session.user as any).role)) {
        return errorResponse('Cluster has invalid data. Contact an admin.', 500);
      }
    } else {
      await requireTeamMember(cluster.teamId.toString());
    }

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
 * Delete a cluster (team leader or admin).
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

    // Handle corrupt records (missing teamId) — only admins can delete
    if (!cluster.teamId) {
      const session = await auth();
      if (!session?.user?.id || !['admin', 'super_admin'].includes((session.user as any).role)) {
        return errorResponse('Cluster has invalid data. Contact an admin to delete it.', 403);
      }
      // Admin deleting corrupt record — remove directly from database
      // (no Atlas API calls since the record may not have valid Atlas IDs either)
      if (cluster.atlasProjectId) {
        try {
          await deleteCluster(clusterId);
        } catch {
          // If Atlas deletion fails, still remove the corrupt DB record
          cluster.status = 'deleted';
          cluster.deletedAt = new Date();
          await cluster.save();
        }
      } else {
        cluster.status = 'deleted';
        cluster.deletedAt = new Date();
        await cluster.save();
      }
    } else {
      // Normal flow: require team leader
      await requireTeamLeader(cluster.teamId.toString());
      await deleteCluster(clusterId);
    }

    return NextResponse.json({
      success: true,
      message: 'Cluster deletion initiated',
    });
  } catch (error) {
    console.error('[API] Failed to delete cluster:', error);
    return errorResponse(`Failed to delete cluster: ${(error as Error).message}`, 500);
  }
}
