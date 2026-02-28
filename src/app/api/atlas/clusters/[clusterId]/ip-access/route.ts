import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { AtlasClusterModel } from '@/lib/db/models/AtlasCluster';
import { requireTeamLeader, requireTeamMember } from '@/lib/atlas/auth-guard';
import {
  addIpAccessListEntries,
  listIpAccessList,
  removeIpAccessListEntry,
} from '@/lib/atlas/atlas-client';
import { errorResponse } from '@/lib/utils';
import { auth } from '@/lib/auth';

/**
 * POST /api/atlas/clusters/[clusterId]/ip-access
 * Add IP access list entries (team leader only).
 * 
 * Body: {
 *   entries: Array<{ cidrBlock?: string; ipAddress?: string; comment?: string }>;
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clusterId: string }> }
) {
  try {
    const { clusterId } = await params;
    const session = await auth();

    await connectToDatabase();
    const cluster = await AtlasClusterModel.findById(clusterId);

    if (!cluster) {
      return errorResponse('Cluster not found', 404);
    }

    // Require team leader to modify IP access
    await requireTeamLeader(cluster.teamId.toString());

    const body = await req.json();
    const { entries } = body;

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return errorResponse('entries array is required', 400);
    }

    // Validate entries
    for (const entry of entries) {
      if (!entry.cidrBlock && !entry.ipAddress) {
        return errorResponse('Each entry must have cidrBlock or ipAddress', 400);
      }
    }

    // Check max entries limit (20 per cluster)
    if (cluster.ipAccessList.length + entries.length > 20) {
      return errorResponse('Maximum 20 IP access list entries per cluster', 400);
    }

    // Add to Atlas
    await addIpAccessListEntries(cluster.atlasProjectId, entries);

    // Add to cluster record
    const newEntries = entries.map((e) => ({
      cidrBlock: e.cidrBlock || e.ipAddress || '',
      comment: e.comment || '',
      addedAt: new Date(),
      addedBy: session!.user.id,
    }));

    cluster.ipAccessList.push(...newEntries);
    await cluster.save();

    return NextResponse.json({
      success: true,
      added: newEntries,
    });
  } catch (error) {
    console.error('[API] Failed to add IP access entries:', error);
    return errorResponse(
      `Failed to add IP access entries: ${(error as Error).message}`,
      500
    );
  }
}

/**
 * GET /api/atlas/clusters/[clusterId]/ip-access
 * List IP access list entries (team members can view).
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

    // Get from Atlas (source of truth)
    const atlasEntries = await listIpAccessList(cluster.atlasProjectId);

    return NextResponse.json({
      success: true,
      entries: atlasEntries,
    });
  } catch (error) {
    console.error('[API] Failed to list IP access entries:', error);
    return errorResponse(
      `Failed to list IP access entries: ${(error as Error).message}`,
      500
    );
  }
}

/**
 * DELETE /api/atlas/clusters/[clusterId]/ip-access?entry={cidrBlock}
 * Remove an IP access list entry (team leader only).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ clusterId: string }> }
) {
  try {
    const { clusterId } = await params;
    const { searchParams } = new URL(req.url);
    const entry = searchParams.get('entry');

    if (!entry) {
      return errorResponse('entry parameter is required', 400);
    }

    await connectToDatabase();
    const cluster = await AtlasClusterModel.findById(clusterId);

    if (!cluster) {
      return errorResponse('Cluster not found', 404);
    }

    // Require team leader to modify IP access
    await requireTeamLeader(cluster.teamId.toString());

    // Remove from Atlas
    await removeIpAccessListEntry(cluster.atlasProjectId, entry);

    // Remove from cluster record
    cluster.ipAccessList = cluster.ipAccessList.filter(
      (e) => e.cidrBlock !== entry
    );
    await cluster.save();

    return NextResponse.json({
      success: true,
      message: 'IP access entry removed',
    });
  } catch (error) {
    console.error('[API] Failed to remove IP access entry:', error);
    return errorResponse(
      `Failed to remove IP access entry: ${(error as Error).message}`,
      500
    );
  }
}
