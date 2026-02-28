import OpenAI from 'openai';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

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

  return `You are a hackathon mentor helping a team brainstorm creative, feasible project ideas.

EVENT CONTEXT:
- Theme: ${eventTheme}
- Categories: ${eventCategories.join(', ')}
- Available Sponsor Products: ${sponsorProducts.join(', ')}
- Target Prizes: ${targetPrizes.length > 0 ? targetPrizes.join(', ') : 'Any'}

TEAM INFORMATION:
- Team Size: ${teamSize} ${teamSize === 1 ? 'person (solo)' : 'people'}
- Skill Levels: ${skillLevels.join(', ')}
- Team Composition: ${teamComposition.join(', ')}

TECHNOLOGY PREFERENCES:
- Languages: ${preferredLanguages.join(', ')}
- Frameworks: ${preferredFrameworks.join(', ')}
- Databases: ${preferredDatabases.join(', ')}
- Interest Areas: ${interestAreas.join(', ')}

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
  const client = getOpenAIClient();
  
  const prompt = buildPrompt(inputs);
  
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
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
    temperature: 0.8, // Creative but coherent
    max_tokens: 6000, // ~2000 per idea × 3 ideas
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No content in OpenAI response');
  }

  let ideas: ProjectIdea[];
  try {
    const parsed = JSON.parse(content);
    console.log('Parsed OpenAI response:', JSON.stringify(parsed).substring(0, 200) + '...');
    
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
        console.error('Invalid OpenAI response structure:', parsed);
        throw new Error('Response does not contain an array of ideas');
      }
    }
    
    if (ideas.length === 0) {
      throw new Error('No ideas generated');
    }
  } catch (error) {
    console.error('Failed to parse OpenAI response:', content.substring(0, 500));
    throw new Error('Invalid response format from AI: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }

  return {
    ideas: ideas.slice(0, numIdeas),
    tokensUsed: response.usage?.total_tokens || 0,
    model: response.model,
  };
}

/**
 * Stream project idea generation (for future real-time UI)
 */
export async function* streamProjectIdeas(
  inputs: GenerationInputs
): AsyncGenerator<string> {
  const client = getOpenAIClient();
  const prompt = buildPrompt(inputs);

  const stream = await client.chat.completions.create({
    model: 'gpt-4o',
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
    max_tokens: 6000,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}
