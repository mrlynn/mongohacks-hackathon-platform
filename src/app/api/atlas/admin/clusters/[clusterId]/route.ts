import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteCluster } from '@/lib/atlas/provisioning-service';
import { errorResponse } from '@/lib/utils';

/**
 * DELETE /api/atlas/admin/clusters/[clusterId]
 * Admin force delete a cluster (bypass team leader check).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ clusterId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    // Require admin role
    if (!['admin', 'super_admin'].includes((session.user as any).role)) {
      return errorResponse('Admin access required', 403);
    }

    const { clusterId } = await params;

    // Delete the cluster (no team leader check)
    await deleteCluster(clusterId);

    return NextResponse.json({
      success: true,
      message: 'Cluster deletion initiated by admin',
    });
  } catch (error) {
    console.error('[API] Admin cluster delete failed:', error);
    return errorResponse(
      `Failed to delete cluster: ${(error as Error).message}`,
      500
    );
  }
}
