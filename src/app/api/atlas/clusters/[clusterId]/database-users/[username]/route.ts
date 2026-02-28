import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { AtlasClusterModel } from '@/lib/db/models/AtlasCluster';
import { requireTeamLeader } from '@/lib/atlas/auth-guard';
import { deleteAtlasDatabaseUser } from '@/lib/atlas/atlas-client';
import { errorResponse } from '@/lib/utils';

/**
 * DELETE /api/atlas/clusters/[clusterId]/database-users/[username]
 * Delete a database user (team leader only).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ clusterId: string; username: string }> }
) {
  try {
    const { clusterId, username } = await params;

    await connectToDatabase();
    const cluster = await AtlasClusterModel.findById(clusterId);

    if (!cluster) {
      return errorResponse('Cluster not found', 404);
    }

    // Require team leader to delete users
    await requireTeamLeader(cluster.teamId.toString());

    // Delete from Atlas
    await deleteAtlasDatabaseUser(cluster.atlasProjectId, username);

    // Remove from cluster record
    cluster.databaseUsers = cluster.databaseUsers.filter(
      (u) => u.username !== username
    );
    await cluster.save();

    return NextResponse.json({
      success: true,
      message: 'Database user deleted',
    });
  } catch (error) {
    console.error('[API] Failed to delete database user:', error);
    return errorResponse(
      `Failed to delete database user: ${(error as Error).message}`,
      500
    );
  }
}
