import { IProjectIdea } from "@/lib/db/models/ProjectIdea";
import { IEvent } from "@/lib/db/models/Event";
import OpenAI from "openai";
import { logAiUsage } from "@/lib/ai/usage-logger";

export type PromptVariant = "full-scaffold" | "backend-first" | "frontend-first";

export interface BuilderPromptOptions {
  idea: IProjectIdea;
  event: IEvent;
  variant: PromptVariant;
  enhance?: boolean;
}

export interface BuilderPromptResult {
  prompt: string;
  variant: PromptVariant;
  enhanced: boolean;
  tokenEstimate: number;
  metadata: {
    ideaId: string;
    ideaName: string;
    eventName: string;
    generatedAt: string;
  };
}

/**
 * Generates a builder prompt from a saved ProjectIdea.
 *
 * Base generation is pure template interpolation (no AI call).
 * Optional enhancement pass uses GPT-4o to refine architecture
 * recommendations and add stack-specific best practices.
 */
export async function generateBuilderPrompt(
  options: BuilderPromptOptions
): Promise<BuilderPromptResult> {
  const { idea, event, variant, enhance = false } = options;

  // 1. Build context block (shared across all variants)
  const contextBlock = buildContextBlock(idea, event);

  // 2. Build tech requirements block
  const techBlock = buildTechBlock(idea);

  // 3. Build implementation plan block
  const planBlock = buildPlanBlock(idea);

  // 4. Build constraints block
  const constraintsBlock = buildConstraintsBlock(idea, event);

  // 5. Build variant-specific output instructions
  const outputBlock = buildOutputBlock(variant);

  // 6. Assemble full prompt
  let prompt = [
    contextBlock,
    techBlock,
    planBlock,
    constraintsBlock,
    outputBlock,
  ].join("\n\n---\n\n");

  // 7. Optional GPT-4o enhancement
  if (enhance) {
    prompt = await enhancePromptWithAI(prompt, idea, event);
  }

  // 8. Estimate tokens (~4 chars per token for English)
  const tokenEstimate = Math.ceil(prompt.length / 4);

  return {
    prompt,
    variant,
    enhanced: enhance,
    tokenEstimate,
    metadata: {
      ideaId: idea._id.toString(),
      ideaName: idea.idea.name,
      eventName: event.name,
      generatedAt: new Date().toISOString(),
    },
  };
}

function buildContextBlock(idea: IProjectIdea, event: IEvent): string {
  const inputs = idea.inputs;
  return `# Project: ${idea.idea.name}

## Context

You are helping a hackathon team build a project. Here is the full context:

**Project Name:** ${idea.idea.name}
**Tagline:** ${idea.idea.tagline}

**Problem Statement:**
${idea.idea.problemStatement}

**Solution:**
${idea.idea.solution}

**Event Theme:** ${event.theme || "Open"}
**Hackathon Duration:** ${inputs.timeCommitment || "Not specified"} hours
**Complexity Target:** ${inputs.complexityPreference || "Medium"}
**Team Size:** ${inputs.teamSize || "Not specified"} developers
**Skill Levels:** ${(inputs.skillLevels || []).join(", ") || "Mixed"}`;
}

function buildTechBlock(idea: IProjectIdea): string {
  const ts = idea.idea.techStack;
  const inputs = idea.inputs;

  let block = `## Technical Requirements

### Tech Stack

- **Frontend:** ${formatList(ts.frontend)}
- **Backend:** ${formatList(ts.backend)}
- **Database:** ${formatList(ts.database)}
- **APIs & Services:** ${formatList(ts.apis)}
- **Deployment:** ${formatList(ts.deployment)}`;

  if (inputs.preferredLanguages?.length) {
    block += `\n\n**Languages the team knows:** ${inputs.preferredLanguages.join(", ")}`;
  }

  if (inputs.preferredFrameworks?.length) {
    block += `\n**Frameworks the team prefers:** ${inputs.preferredFrameworks.join(", ")}`;
  }

  block += `

### Architecture

Based on the tech stack and team size, use this architecture:

- Monorepo with clear separation between frontend and backend
- RESTful API with structured JSON responses
- Environment-based configuration (.env files)
- Git-ready with .gitignore for the stack

### Database Schema

Design the database schema for all core entities described in the solution. Include:

- All collections/tables needed
- Field types and validation rules
- Indexes for query performance
- Relationships between entities

### API Endpoints

Scaffold API routes covering:

- CRUD operations for each core entity
- Authentication endpoints (if applicable)
- Any third-party API integrations mentioned in the tech stack`;

  return block;
}

function buildPlanBlock(idea: IProjectIdea): string {
  const timeline = idea.idea.timeline || [];

  let block = `## Implementation Plan

The team has **${idea.inputs.timeCommitment || "~24"} hours** total. Here is the phased plan:\n`;

  timeline.forEach((phase, i) => {
    block += `\n### Phase ${i + 1}: ${phase.phase} (${phase.hours} hours)\n`;
    (phase.tasks || []).forEach((task: string) => {
      block += `- ${task}\n`;
    });
  });

  return block;
}

function buildConstraintsBlock(idea: IProjectIdea, event: IEvent): string {
  return `## Priorities for Judging

This project targets the **${idea.idea.prizeCategories || "General"}** prize category.

**Key differentiator:** ${idea.idea.differentiator || "See solution description above."}

**Difficulty level:** ${idea.idea.difficulty || "Not rated"}/5

Focus demo effort on:
1. The core functionality that demonstrates the problem-solution fit
2. Visual polish on the primary user flow
3. A compelling 2-minute walkthrough narrative

${event.rules ? `**Event Rules to Follow:**\n${event.rules}` : ""}

${event.judging_criteria?.length ? `**Judging Criteria:** ${event.judging_criteria.join(", ")}` : ""}`;
}

function buildOutputBlock(variant: PromptVariant): string {
  switch (variant) {
    case "full-scaffold":
      return FULL_SCAFFOLD_INSTRUCTIONS;
    case "backend-first":
      return BACKEND_FIRST_INSTRUCTIONS;
    case "frontend-first":
      return FRONTEND_FIRST_INSTRUCTIONS;
  }
}

function formatList(items: string | string[]): string {
  if (!items) return "Not specified";
  if (typeof items === "string") return items;
  return items.join(", ") || "Not specified";
}

const FULL_SCAFFOLD_INSTRUCTIONS = `## Output Instructions

Please generate the following in order:

1. **Project scaffold** — folder structure, package.json (or equivalent), config files, .env.example
2. **Database models/schema** — full schema definitions with validation
3. **API route stubs** — endpoint files with request/response types, placeholder logic
4. **Frontend page structure** — routing setup, layout components, page shells
5. **Core feature implementation** — start with Phase 1 tasks from the timeline above

Use TypeScript if the tech stack includes it. Add brief comments explaining architectural decisions. Keep code production-ready but pragmatic — this is a hackathon, not enterprise software.`;

const BACKEND_FIRST_INSTRUCTIONS = `## Output Instructions

Please generate the backend foundation in this order:

1. **Project setup** — Initialize the backend with the specified stack. Include package.json, tsconfig (if TypeScript), and environment configuration.
2. **Database connection** — Connection module with pooling and error handling.
3. **Database models/schema** — Complete schema definitions for all entities. Include validation, indexes, and relationships.
4. **Authentication** — Auth middleware, JWT or session setup, login/register endpoints.
5. **API routes** — Full CRUD endpoints for each entity with error handling, input validation, and structured responses.
6. **Business logic** — Core service functions for the main feature described in the solution.
7. **Seed data script** — A script to populate the database with realistic test data.

Keep the code modular — one file per model, one file per route group, shared utilities extracted.`;

const FRONTEND_FIRST_INSTRUCTIONS = `## Output Instructions

Please generate the frontend foundation in this order:

1. **Project setup** — Initialize with the specified frontend framework. Include routing and global styles/theme.
2. **Component architecture** — Create a component tree showing the hierarchy of pages and shared components.
3. **Layout components** — App shell, navigation, sidebar (if applicable), footer. Make them responsive.
4. **Page shells** — Route-connected page components with placeholder content for each feature.
5. **Core UI components** — Forms, cards, lists, and modals for the primary user flow.
6. **API integration layer** — HTTP client with typed request/response functions. Use mock data until backend is ready.
7. **State management** — Global state setup for auth and core data.

Prioritize the primary user journey — the flow that will be demoed to judges.`;

async function enhancePromptWithAI(
  basePrompt: string,
  idea: IProjectIdea,
  event: IEvent
): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const startTime = Date.now();
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.4,
    max_tokens: 4000,
    messages: [
      {
        role: "system",
        content: `You are a senior software architect helping hackathon teams. You will receive a builder prompt for a hackathon project. Your job is to enhance it by:

1. Adding specific architectural patterns that fit the tech stack (e.g., if Next.js, suggest App Router patterns; if Express, suggest middleware patterns)
2. Adding 3-5 concrete database schema suggestions with field names and types
3. Adding specific API endpoint paths with HTTP methods
4. Adding a "Quick Wins" section with 3 things the team can build in the first hour
5. Adding a "Common Pitfalls" section with 3 mistakes to avoid for this stack

Return the COMPLETE enhanced prompt in Markdown. Do not remove any existing content — only add to it.`,
      },
      {
        role: "user",
        content: basePrompt,
      },
    ],
  });

  // Log AI usage
  await logAiUsage({
    category: "project_suggestions",
    provider: "openai",
    model: "gpt-4o",
    operation: "builder_prompt_enhancement",
    tokensUsed: response.usage?.total_tokens || 0,
    promptTokens: response.usage?.prompt_tokens || 0,
    completionTokens: response.usage?.completion_tokens || 0,
    durationMs: Date.now() - startTime,
    userId: idea.userId?.toString(),
    eventId: idea.eventId?.toString(),
  });

  return response.choices[0]?.message?.content || basePrompt;
}
