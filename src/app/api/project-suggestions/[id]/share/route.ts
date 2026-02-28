import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/connection';
import { ProjectIdeaModel } from '@/lib/db/models/ProjectIdea';
import { successResponse, errorResponse } from '@/lib/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }

    const userId = (session.user as any).id;
    const { id } = await params;
    const body = await request.json();
    const { recipients, message } = body;

    await connectToDatabase();

    const projectIdea = await ProjectIdeaModel.findOne({
      _id: id,
      userId,
    });

    if (!projectIdea) {
      return errorResponse('Project idea not found', 404);
    }

    // Mark as shared
    projectIdea.shared = true;
    await projectIdea.save();

    // Generate share link (public view)
    const shareLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'}/project-suggestions/shared/${id}`;

    // TODO: Send email/notification to recipients
    // For now, just return the share link

    return successResponse({
      shareLink,
      recipients: recipients || [],
      message: message || '',
    });
  } catch (error) {
    console.error('POST /api/project-suggestions/[id]/share error:', error);
    return errorResponse('Failed to share idea', 500);
  }
}
