import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/connection';
import { ProjectIdeaModel } from '@/lib/db/models/ProjectIdea';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }

    const userId = (session.user as any).id;

    await connectToDatabase();

    const savedIdeas = await ProjectIdeaModel.find({
      userId,
      saved: true,
    })
      .sort({ generatedAt: -1 })
      .limit(50)
      .lean();

    return successResponse({
      ideas: savedIdeas,
      total: savedIdeas.length,
    });
  } catch (error) {
    console.error('GET /api/project-suggestions/saved error:', error);
    return errorResponse('Failed to fetch saved ideas', 500);
  }
}
