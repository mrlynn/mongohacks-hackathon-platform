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

    // Fetch those events
    const registeredEvents = await EventModel.find({
      _id: { $in: userProjects },
    })
      .select('_id name theme startDate endDate status')
      .sort({ startDate: -1 })
      .lean();

    // Also fetch upcoming/active events (in case user hasn't registered yet)
    const upcomingEvents = await EventModel.find({
      status: { $in: ['upcoming', 'active'] },
    })
      .select('_id name theme startDate endDate status')
      .sort({ startDate: 1 })
      .limit(10)
      .lean();

    // Combine and deduplicate
    const allEventsMap = new Map();
    
    registeredEvents.forEach((event) => {
      allEventsMap.set(event._id.toString(), { ...event, registered: true });
    });
    
    upcomingEvents.forEach((event) => {
      const id = event._id.toString();
      if (!allEventsMap.has(id)) {
        allEventsMap.set(id, { ...event, registered: false });
      }
    });

    const events = Array.from(allEventsMap.values());

    return successResponse({
      events,
      total: events.length,
      registeredCount: registeredEvents.length,
    });
  } catch (error) {
    console.error('GET /api/project-suggestions/events error:', error);
    return errorResponse('Failed to fetch events', 500);
  }
}
