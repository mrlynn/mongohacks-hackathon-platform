import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/connection';
import { TeamModel } from '@/lib/db/models/Team';
import { AtlasClusterModel } from '@/lib/db/models/AtlasCluster';
import { EventModel } from '@/lib/db/models/Event';
import { provisionCluster, ConflictError } from '@/lib/atlas/provisioning-service';
import { errorResponse } from '@/lib/utils';

/**
 * POST /api/atlas/clusters
 * Provision a new M0 Atlas cluster for a team.
 * 
 * Body: {
 *   teamId: string;
 *   provider?: 'AWS' | 'GCP' | 'AZURE';
 *   region?: string;
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    const body = await req.json();
    const { teamId, provider, region } = body;

    if (!teamId) {
      return errorResponse('teamId is required', 400);
    }

    await connectToDatabase();

    // Verify user is team leader (admins bypass)
    const team = await TeamModel.findById(teamId);
    if (!team) {
      return errorResponse('Team not found', 404);
    }

    const isAdmin = ['admin', 'super_admin'].includes((session.user as any).role);
    const isTeamLeader = team.leaderId.toString() === session.user!.id;

    if (!isAdmin && !isTeamLeader) {
      return errorResponse('Only the team leader can provision a cluster', 403);
    }

    // Get event from team and verify provisioning is enabled
    const eventId = team.eventId.toString();
    const event = await EventModel.findById(eventId);
    
    if (!event?.atlasProvisioning?.enabled) {
      return errorResponse('Atlas cluster provisioning is not enabled for this event', 403);
    }

    // Check if cluster already exists
    const existing = await AtlasClusterModel.findOne({
      eventId,
      teamId,
      status: { $nin: ['deleted', 'error'] },
    });

    if (existing) {
      return errorResponse('A cluster already exists for this team', 409);
    }

    // Provision the cluster (projectId = teamId for Atlas project naming)
    const cluster = await provisionCluster({
      eventId,
      teamId,
      projectId: teamId, // Use teamId as Atlas project identifier
      userId: session.user!.id,
      provider,
      region,
    });

    return NextResponse.json({
      success: true,
      cluster: {
        id: cluster._id,
        atlasProjectId: cluster.atlasProjectId,
        atlasProjectName: cluster.atlasProjectName,
        atlasClusterName: cluster.atlasClusterName,
        status: cluster.status,
        connectionString: cluster.connectionString,
        standardConnectionString: cluster.standardConnectionString,
        providerName: cluster.providerName,
        regionName: cluster.regionName,
        createdAt: cluster.createdAt,
      },
      credentials: cluster._initialCredentials, // Only returned once
    });
  } catch (error) {
    console.error('[API] Cluster provisioning failed:', error);

    if (error instanceof ConflictError) {
      return errorResponse(error.message, 409);
    }

    return errorResponse(
      `Failed to provision cluster: ${(error as Error).message}`,
      500
    );
  }
}

/**
 * GET /api/atlas/clusters?teamId={teamId}&eventId={eventId}
 * List clusters for a team or event.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');
    const eventId = searchParams.get('eventId');

    if (!teamId && !eventId) {
      return errorResponse('teamId or eventId is required', 400);
    }

    await connectToDatabase();

    const query: Record<string, unknown> = {
      status: { $nin: ['deleted'] }, // Never return deleted clusters to the UI
    };
    if (teamId) query.teamId = teamId;
    if (eventId) query.eventId = eventId;

    // Non-admins can only see their own team's clusters
    const isAdmin = ['admin', 'super_admin'].includes((session.user as any).role);
    if (!isAdmin && teamId) {
      const team = await TeamModel.findById(teamId);
      if (!team) {
        return errorResponse('Team not found', 404);
      }

      const isMember =
        team.leaderId.toString() === session.user!.id ||
        team.members?.some((m: any) => m.toString() === session.user!.id);

      if (!isMember) {
        return errorResponse('Access denied', 403);
      }
    }

    const clusters = await AtlasClusterModel.find(query)
      .select('-databaseUsers -ipAccessList') // Exclude sensitive details
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      clusters,
    });
  } catch (error) {
    console.error('[API] Failed to list clusters:', error);
    return errorResponse(`Failed to list clusters: ${(error as Error).message}`, 500);
  }
}
