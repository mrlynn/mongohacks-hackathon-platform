import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/connection';
import { EventModel } from '@/lib/db/models/Event';
import { ProjectIdeaModel } from '@/lib/db/models/ProjectIdea';
import { generateProjectIdeas } from '@/lib/ai/project-suggestion';
import { successResponse, errorResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    
    const {
      eventId,
      inputs,
      numIdeas = 3,
    } = body;

    if (!eventId || !inputs) {
      return errorResponse('Missing required fields', 400);
    }

    await connectToDatabase();

    // Fetch event details
    const event = await EventModel.findById(eventId).lean();
    if (!event) {
      return errorResponse('Event not found', 404);
    }

    // Check rate limiting (max 5 generations per user per event)
    const existingIdeas = await ProjectIdeaModel.countDocuments({
      userId,
      eventId,
    });

    if (existingIdeas >= 5) {
      return errorResponse(
        'Maximum generations reached. You can generate up to 5 idea sets per event.',
        429
      );
    }

    // Build generation context with safe defaults
    const generationInputs = {
      eventTheme: event.theme || event.name || 'General Hackathon',
      eventCategories: event.categories || [],
      sponsorProducts: event.partners?.map((p: any) => p.name) || [],
      teamSize: inputs.teamSize || 1,
      skillLevels: inputs.skillLevels || [],
      teamComposition: inputs.teamComposition || [],
      preferredLanguages: inputs.preferredLanguages || [],
      preferredFrameworks: inputs.preferredFrameworks || [],
      preferredDatabases: inputs.preferredDatabases || [],
      interestAreas: inputs.interestAreas || [],
      timeCommitment: inputs.timeCommitment || 24,
      complexityPreference: inputs.complexityPreference || 'moderate',
      targetPrizes: inputs.targetPrizes || [],
    };

    // Generate ideas with AI
    const result = await generateProjectIdeas(generationInputs, numIdeas);

    // Save all generated ideas to database
    const savedIdeas = await Promise.all(
      result.ideas.map(async (idea) => {
        const projectIdea = new ProjectIdeaModel({
          userId,
          eventId,
          inputs,
          idea,
          saved: false,
          shared: false,
          teamVotes: [],
          generatedAt: new Date(),
          model: result.model,
          tokensUsed: Math.floor(result.tokensUsed / result.ideas.length),
        });
        return await projectIdea.save();
      })
    );

    return successResponse({
      ideas: savedIdeas,
      cached: false,
      tokensUsed: result.tokensUsed,
      remainingGenerations: 5 - existingIdeas - 1,
    });
  } catch (error) {
    console.error('POST /api/project-suggestions/generate error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to generate ideas',
      500
    );
  }
}
