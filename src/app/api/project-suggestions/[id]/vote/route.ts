import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/connection';
import { ProjectIdeaModel } from '@/lib/db/models/ProjectIdea';
import { successResponse, errorResponse } from '@/lib/utils';
import mongoose from 'mongoose';

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
    const { vote, comment } = body;

    if (!vote || !['up', 'down'].includes(vote)) {
      return errorResponse('Invalid vote value. Must be "up" or "down"', 400);
    }

    await connectToDatabase();

    const projectIdea = await ProjectIdeaModel.findById(id);

    if (!projectIdea) {
      return errorResponse('Project idea not found', 404);
    }

    // Remove existing vote from this user
    projectIdea.teamVotes = projectIdea.teamVotes.filter(
      (v: any) => v.userId.toString() !== userId
    );

    // Add new vote
    projectIdea.teamVotes.push({
      userId: new mongoose.Types.ObjectId(userId),
      vote,
      comment: comment || undefined,
      createdAt: new Date(),
    });

    await projectIdea.save();

    // Calculate vote counts
    const upvotes = projectIdea.teamVotes.filter((v: any) => v.vote === 'up').length;
    const downvotes = projectIdea.teamVotes.filter((v: any) => v.vote === 'down').length;

    return successResponse({
      success: true,
      vote,
      upvotes,
      downvotes,
      totalVotes: projectIdea.teamVotes.length,
    });
  } catch (error) {
    console.error('POST /api/project-suggestions/[id]/vote error:', error);
    return errorResponse('Failed to vote', 500);
  }
}

export async function DELETE(
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

    await connectToDatabase();

    const projectIdea = await ProjectIdeaModel.findById(id);

    if (!projectIdea) {
      return errorResponse('Project idea not found', 404);
    }

    // Remove vote from this user
    projectIdea.teamVotes = projectIdea.teamVotes.filter(
      (v: any) => v.userId.toString() !== userId
    );

    await projectIdea.save();

    return successResponse({ success: true, removed: true });
  } catch (error) {
    console.error('DELETE /api/project-suggestions/[id]/vote error:', error);
    return errorResponse('Failed to remove vote', 500);
  }
}
