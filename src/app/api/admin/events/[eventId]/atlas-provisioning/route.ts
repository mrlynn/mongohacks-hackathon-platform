import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/connection';
import { EventModel } from '@/lib/db/models/Event';
import { errorResponse } from '@/lib/utils';

/**
 * PATCH /api/admin/events/[eventId]/atlas-provisioning
 * Enable/disable Atlas provisioning and configure allowed providers for an event
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401);
    }

    if (!['admin', 'super_admin'].includes((session.user as any).role)) {
      return errorResponse('Admin access required', 403);
    }

    // Await params in Next.js 16
    const { eventId } = await params;

    const body = await req.json();
    const { enabled, allowedProviders } = body;

    if (typeof enabled !== 'boolean') {
      return errorResponse('enabled must be a boolean', 400);
    }

    // Validate allowedProviders if provided
    if (allowedProviders !== undefined) {
      if (!Array.isArray(allowedProviders)) {
        return errorResponse('allowedProviders must be an array', 400);
      }

      const validProviders = ['AWS', 'GCP', 'AZURE'];
      const invalidProviders = allowedProviders.filter(p => !validProviders.includes(p));
      
      if (invalidProviders.length > 0) {
        return errorResponse(
          `Invalid providers: ${invalidProviders.join(', ')}. Must be one of: ${validProviders.join(', ')}`,
          400
        );
      }

      if (allowedProviders.length === 0) {
        return errorResponse('At least one cloud provider must be allowed', 400);
      }
    }

    await connectToDatabase();

    const event = await EventModel.findById(eventId);
    if (!event) {
      return errorResponse('Event not found', 404);
    }

    // Initialize or update atlasProvisioning config
    if (!event.atlasProvisioning) {
      event.atlasProvisioning = {
        enabled,
        defaultProvider: 'AWS',
        defaultRegion: 'US_EAST_1',
        openNetworkAccess: true,
        maxDbUsersPerCluster: 5,
        autoCleanupOnEventEnd: true,
        allowedProviders: allowedProviders || ['AWS', 'GCP', 'AZURE'],
        allowedRegions: ['US_EAST_1', 'EU_WEST_1'],
      };
    } else {
      event.atlasProvisioning.enabled = enabled;
      
      if (allowedProviders !== undefined) {
        event.atlasProvisioning.allowedProviders = allowedProviders;
        
        // Update defaultProvider if it's no longer in allowed list
        if (!allowedProviders.includes(event.atlasProvisioning.defaultProvider)) {
          event.atlasProvisioning.defaultProvider = allowedProviders[0];
        }
      }
    }

    await event.save();

    return NextResponse.json({
      success: true,
      atlasProvisioning: event.atlasProvisioning,
    });
  } catch (error) {
    console.error('[API] Failed to update Atlas provisioning:', error);
    return errorResponse(
      `Failed to update Atlas provisioning: ${(error as Error).message}`,
      500
    );
  }
}
