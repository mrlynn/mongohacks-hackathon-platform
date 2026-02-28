import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/connection';
import { ProjectIdeaModel } from '@/lib/db/models/ProjectIdea';
import { EventModel } from '@/lib/db/models/Event';
import { generateProjectIdeas } from '@/lib/ai/project-suggestion';
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
    const body = await request.json();
    const { refinement } = body;

    if (!refinement) {
      return errorResponse('Refinement instruction required', 400);
    }

    await connectToDatabase();

    // Fetch original idea
    const originalIdea = await ProjectIdeaModel.findOne({
      _id: id,
      userId,
    });

    if (!originalIdea) {
      return errorResponse('Project idea not found', 404);
    }

    // Fetch event details
    const event = await EventModel.findById(originalIdea.eventId).lean();
    if (!event) {
      return errorResponse('Event not found', 404);
    }

    // Apply refinement adjustments
    const adjustedInputs = { ...originalIdea.inputs };

    // Parse refinement instruction
    const refinementLower = refinement.toLowerCase();

    if (refinementLower.includes('simpler') || refinementLower.includes('easier')) {
      adjustedInputs.complexityPreference = 'simple';
      adjustedInputs.timeCommitment = Math.max(12, (adjustedInputs.timeCommitment || 24) - 12);
    } else if (refinementLower.includes('complex') || refinementLower.includes('ambitious')) {
      adjustedInputs.complexityPreference = 'ambitious';
      adjustedInputs.timeCommitment = Math.min(48, (adjustedInputs.timeCommitment || 24) + 12);
    }

    if (refinementLower.includes('more ai') || refinementLower.includes('add ai')) {
      if (!adjustedInputs.interestAreas.includes('AI/ML')) {
        adjustedInputs.interestAreas.push('AI/ML');
      }
    }

    if (refinementLower.includes('different stack') || refinementLower.includes('change tech')) {
      // Rotate to different tech options (simple approach)
      adjustedInputs.preferredFrameworks = ['Vue', 'Flask', 'FastAPI'];
    }

    // Build generation context with adjusted inputs
    const generationInputs = {
      eventTheme: event.theme || event.name,
      eventCategories: event.categories || [],
      sponsorProducts: event.partners?.map((p: any) => p.name) || [],
      teamSize: adjustedInputs.teamSize,
      skillLevels: adjustedInputs.skillLevels,
      teamComposition: adjustedInputs.teamComposition,
      preferredLanguages: adjustedInputs.preferredLanguages,
      preferredFrameworks: adjustedInputs.preferredFrameworks,
      preferredDatabases: adjustedInputs.preferredDatabases,
      interestAreas: adjustedInputs.interestAreas,
      timeCommitment: adjustedInputs.timeCommitment,
      complexityPreference: adjustedInputs.complexityPreference,
      targetPrizes: adjustedInputs.targetPrizes,
    };

    // Generate refined idea
    const result = await generateProjectIdeas(generationInputs, 1);

    if (!result.ideas || result.ideas.length === 0) {
      return errorResponse('Failed to generate refined idea', 500);
    }

    // Save refined idea
    const refinedIdea = new ProjectIdeaModel({
      userId,
      eventId: originalIdea.eventId,
      inputs: adjustedInputs,
      idea: result.ideas[0],
      saved: false,
      shared: false,
      teamVotes: [],
      generatedAt: new Date(),
      model: result.model,
      tokensUsed: result.tokensUsed,
    });

    await refinedIdea.save();

    return successResponse({
      refinedIdea,
      originalId: id,
      refinement,
      adjustments: {
        complexity: adjustedInputs.complexityPreference,
        timeCommitment: adjustedInputs.timeCommitment,
      },
    });
  } catch (error) {
    console.error('POST /api/project-suggestions/[id]/refine error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to refine idea',
      500
    );
  }
}
