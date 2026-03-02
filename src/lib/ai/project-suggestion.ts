import { generateJSON, streamText } from './provider';
import { logAiUsage } from './usage-logger';

interface GenerationInputs {
  eventTheme: string;
  eventCategories: string[];
  sponsorProducts: string[];
  teamSize: number;
  skillLevels: string[];
  teamComposition: string[];
  preferredLanguages: string[];
  preferredFrameworks: string[];
  preferredDatabases: string[];
  interestAreas: string[];
  timeCommitment: number;
  complexityPreference: string;
  targetPrizes: string[];
}

interface ProjectIdea {
  name: string;
  tagline: string;
  problemStatement: string;
  solution: string;
  techStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    apis: string[];
    deployment: string[];
  };
  timeline: {
    phase: string;
    hours: string;
    tasks: string[];
  }[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  prizeCategories: string[];
  differentiator: string;
  implementationGuide: string;
}

interface GenerationResult {
  ideas: ProjectIdea[];
  tokensUsed: number;
  model: string;
}

function buildPrompt(inputs: GenerationInputs): string {
  const {
    eventTheme,
    eventCategories,
    sponsorProducts,
    teamSize,
    skillLevels,
    teamComposition,
    preferredLanguages,
    preferredFrameworks,
    preferredDatabases,
    interestAreas,
    timeCommitment,
    complexityPreference,
    targetPrizes,
  } = inputs;

  // Safely handle potentially undefined arrays
  const safeEventCategories = eventCategories || [];
  const safeSponsorProducts = sponsorProducts || [];
  const safeTargetPrizes = targetPrizes || [];
  const safeSkillLevels = skillLevels || [];
  const safeTeamComposition = teamComposition || [];
  const safeLanguages = preferredLanguages || [];
  const safeFrameworks = preferredFrameworks || [];
  const safeDatabases = preferredDatabases || [];
  const safeInterestAreas = interestAreas || [];

  return `You are a hackathon mentor helping a team brainstorm creative, feasible project ideas.

EVENT CONTEXT:
- Theme: ${eventTheme}
- Categories: ${safeEventCategories.length > 0 ? safeEventCategories.join(', ') : 'Open Theme'}
- Available Sponsor Products: ${safeSponsorProducts.length > 0 ? safeSponsorProducts.join(', ') : 'Any'}
- Target Prizes: ${safeTargetPrizes.length > 0 ? safeTargetPrizes.join(', ') : 'Any'}

TEAM INFORMATION:
- Team Size: ${teamSize} ${teamSize === 1 ? 'person (solo)' : 'people'}
- Skill Levels: ${safeSkillLevels.length > 0 ? safeSkillLevels.join(', ') : 'Mixed'}
- Team Composition: ${safeTeamComposition.length > 0 ? safeTeamComposition.join(', ') : 'Full-stack'}

TECHNOLOGY PREFERENCES:
- Languages: ${safeLanguages.length > 0 ? safeLanguages.join(', ') : 'Any'}
- Frameworks: ${safeFrameworks.length > 0 ? safeFrameworks.join(', ') : 'Any'}
- Databases: ${safeDatabases.length > 0 ? safeDatabases.join(', ') : 'Any'}
- Interest Areas: ${safeInterestAreas.length > 0 ? safeInterestAreas.join(', ') : 'Any'}

CONSTRAINTS:
- Time Budget: ${timeCommitment} hours
- Complexity: ${complexityPreference}

Generate 3 unique hackathon project ideas that:
1. Align with the event theme and categories
2. Meaningfully utilize at least one sponsor product (not shoehorned)
3. Match the team's skill level and size
4. Are feasible within ${timeCommitment} hours
5. Have a unique innovation angle or differentiator
6. Include practical utility or social impact

Return a JSON object with this EXACT structure:
{
  "ideas": [
    {
      "name": "Catchy project name (3-5 words)",
      "tagline": "One-sentence elevator pitch",
      "problemStatement": "2-3 sentences describing the problem",
      "solution": "3-4 sentences describing the proposed solution",
      "techStack": {
        "frontend": ["specific frameworks/libraries"],
        "backend": ["specific frameworks/libraries"],
        "database": ["specific databases"],
        "apis": ["sponsor products and third-party APIs"],
        "deployment": ["platforms/services"]
      },
      "timeline": [
        {
          "phase": "Foundation",
          "hours": "1-4",
          "tasks": ["Task 1", "Task 2", "Task 3"]
        },
        {
          "phase": "Core Features",
          "hours": "5-12",
          "tasks": ["Task 1", "Task 2"]
        },
        {
          "phase": "Integration",
          "hours": "13-18",
          "tasks": ["Task 1", "Task 2"]
        },
        {
          "phase": "Polish & Demo",
          "hours": "19-${timeCommitment}",
          "tasks": ["Task 1", "Task 2"]
        }
      ],
      "difficulty": 3,
      "prizeCategories": ["Prize categories this project qualifies for"],
      "differentiator": "What makes this idea unique or innovative",
      "implementationGuide": "Brief markdown guide with key implementation tips, API setup steps, and gotchas to avoid"
    }
  ]
}

IMPORTANT: Return ONLY the JSON object with an "ideas" array containing exactly 3 project ideas. No additional text.`;
}

export async function generateProjectIdeas(
  inputs: GenerationInputs,
  numIdeas: number = 3
): Promise<GenerationResult> {
  const prompt = buildPrompt(inputs);
  const startTime = Date.now();

  const result = await generateJSON({
    messages: [
      {
        role: 'system',
        content: 'You are a helpful hackathon mentor who generates creative, feasible project ideas in JSON format.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.8,
    maxTokens: 6000,
  });

  const content = result.content;
  if (!content) {
    throw new Error('No content in AI response');
  }

  let ideas: ProjectIdea[];
  try {
    const parsed = JSON.parse(content);
    console.log('Parsed AI response:', JSON.stringify(parsed).substring(0, 200) + '...');
    
    // Handle multiple possible response formats
    if (Array.isArray(parsed)) {
      // Direct array (shouldn't happen with json_object format)
      ideas = parsed;
    } else if (parsed.ideas && Array.isArray(parsed.ideas)) {
      // { ideas: [...] } format
      ideas = parsed.ideas;
    } else if (parsed.projects && Array.isArray(parsed.projects)) {
      // { projects: [...] } format
      ideas = parsed.projects;
    } else {
      // Try to extract any array from the object
      const values = Object.values(parsed);
      const arrayValue = values.find((v) => Array.isArray(v));
      if (arrayValue && Array.isArray(arrayValue)) {
        ideas = arrayValue;
      } else {
        console.error('Invalid AI response structure:', parsed);
        throw new Error('Response does not contain an array of ideas');
      }
    }
    
    if (ideas.length === 0) {
      throw new Error('No ideas generated');
    }
  } catch (error) {
    console.error('Failed to parse AI response:', content.substring(0, 500));
    throw new Error('Invalid response format from AI: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }

  logAiUsage({
    category: 'project_suggestions',
    provider: 'openai',
    model: result.model,
    operation: 'chat_completion',
    tokensUsed: result.usage.totalTokens,
    promptTokens: result.usage.promptTokens,
    completionTokens: result.usage.completionTokens,
    durationMs: Date.now() - startTime,
  });

  return {
    ideas: ideas.slice(0, numIdeas),
    tokensUsed: result.usage.totalTokens,
    model: result.model,
  };
}

/**
 * Stream project idea generation (for future real-time UI)
 */
export async function* streamProjectIdeas(
  inputs: GenerationInputs
): AsyncGenerator<string> {
  const prompt = buildPrompt(inputs);

  const stream = streamText({
    messages: [
      {
        role: 'system',
        content: 'You are a helpful hackathon mentor who generates creative, feasible project ideas.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.8,
    maxTokens: 6000,
  });

  for await (const chunk of stream) {
    yield chunk;
  }
}
