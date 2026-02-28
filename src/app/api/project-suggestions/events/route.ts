import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/connection';
import { EventModel } from '@/lib/db/models/Event';
import { ProjectModel } from '@/lib/db/models/Project';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }

    const userId = (session.user as any).id;

    await connectToDatabase();

    // Find events where user has registered projects
    const userProjects = await ProjectModel.find({ userId }).distinct('eventId');

    // Fetch ALL events (active, upcoming, or past)
    const allEvents = await EventModel.find({})
      .select('_id name theme startDate endDate status')
      .sort({ startDate: -1 })
      .lean();

    // Mark which ones user is registered for
    const events = allEvents.map((event) => ({
      ...event,
      registered: userProjects.some((projectEventId) => 
        projectEventId.toString() === event._id.toString()
      ),
    }));

    // Sort: registered first, then by start date (most recent first)
    events.sort((a, b) => {
      if (a.registered && !b.registered) return -1;
      if (!a.registered && b.registered) return 1;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    const registeredCount = events.filter((e) => e.registered).length;

    return successResponse({
      events,
      total: events.length,
      registeredCount,
    });
  } catch (error) {
    console.error('GET /api/project-suggestions/events error:', error);
    return errorResponse('Failed to fetch events', 500);
  }
}
