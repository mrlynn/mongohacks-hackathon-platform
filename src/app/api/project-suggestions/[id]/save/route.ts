import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/connection';
import { ProjectIdeaModel } from '@/lib/db/models/ProjectIdea';
import { successResponse, errorResponse } from '@/lib/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }

    const userId = (session.user as any).id;
    const { id } = params;

    await connectToDatabase();

    const projectIdea = await ProjectIdeaModel.findOne({
      _id: id,
      userId,
    });

    if (!projectIdea) {
      return errorResponse('Project idea not found', 404);
    }

    projectIdea.saved = true;
    await projectIdea.save();

    return successResponse({ saved: true, id: projectIdea._id });
  } catch (error) {
    console.error('POST /api/project-suggestions/[id]/save error:', error);
    return errorResponse('Failed to save idea', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }

    const userId = (session.user as any).id;
    const { id } = params;

    await connectToDatabase();

    const projectIdea = await ProjectIdeaModel.findOne({
      _id: id,
      userId,
    });

    if (!projectIdea) {
      return errorResponse('Project idea not found', 404);
    }

    projectIdea.saved = false;
    await projectIdea.save();

    return successResponse({ saved: false, id: projectIdea._id });
  } catch (error) {
    console.error('DELETE /api/project-suggestions/[id]/save error:', error);
    return errorResponse('Failed to unsave idea', 500);
  }
}
