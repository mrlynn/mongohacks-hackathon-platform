import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { AtlasClusterModel } from '@/lib/db/models/AtlasCluster';
import { EventModel } from '@/lib/db/models/Event';
import { requireTeamLeader, requireTeamMember } from '@/lib/atlas/auth-guard';
import { createAtlasDatabaseUser, listAtlasDatabaseUsers } from '@/lib/atlas/atlas-client';
import { generateSecurePassword } from '@/lib/atlas/utils';
import { errorResponse } from '@/lib/utils';
import { auth } from '@/lib/auth';

/**
 * POST /api/atlas/clusters/[clusterId]/database-users
 * Create a new database user (team leader only).
 * 
 * Body: {
 *   username: string;
 *   password?: string; // Optional, auto-generated if not provided
 *   roles?: { roleName: string; databaseName: string }[];
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

    // Require team leader to create users
    await requireTeamLeader(cluster.teamId?.toString());

    // Check max users limit
    const event = await EventModel.findById(cluster.eventId);
    const maxUsers = event?.atlasProvisioning?.maxDbUsersPerCluster || 5;

    if (cluster.databaseUsers.length >= maxUsers) {
      return errorResponse(
        `Maximum ${maxUsers} database users per cluster`,
        400
      );
    }

    const body = await req.json();
    const { username, password, roles } = body;

    if (!username) {
      return errorResponse('username is required', 400);
    }

    // Check if user already exists
    const existingUser = cluster.databaseUsers.find((u: any) => u.username === username);
    if (existingUser) {
      return errorResponse('User already exists', 409);
    }

    // Generate password if not provided
    const dbPassword = password || generateSecurePassword();

    // Create user in Atlas
    await createAtlasDatabaseUser(cluster.atlasProjectId, {
      username,
      password: dbPassword,
      clusterName: cluster.atlasClusterName,
      roles,
    });

    // Add to cluster record
    cluster.databaseUsers.push({
      username,
      createdAt: new Date(),
      createdBy: session!.user!.id,
    });
    await cluster.save();

    return NextResponse.json({
      success: true,
      user: {
        username,
        password: dbPassword, // Only returned once
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('[API] Failed to create database user:', error);
    return errorResponse(
      `Failed to create database user: ${(error as Error).message}`,
      500
    );
  }
}

/**
 * GET /api/atlas/clusters/[clusterId]/database-users
 * List database users (team members can view).
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
    await requireTeamMember(cluster.teamId?.toString());

    // Get users from Atlas (includes roles and scopes)
    const atlasUsers = await listAtlasDatabaseUsers(cluster.atlasProjectId);

    // Filter to users scoped to this cluster
    const clusterUsers = atlasUsers.filter((user) =>
      user.scopes?.some((s) => s.name === cluster.atlasClusterName)
    );

    return NextResponse.json({
      success: true,
      users: clusterUsers.map((u: any) => ({
        username: u.username,
        databaseName: u.databaseName,
        roles: u.roles,
        scopes: u.scopes,
      })),
    });
  } catch (error) {
    console.error('[API] Failed to list database users:', error);
    return errorResponse(
      `Failed to list database users: ${(error as Error).message}`,
      500
    );
  }
}
