import OpenAI from "openai";
import { logAiUsage } from "./usage-logger";

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

interface ProjectInput {
  name: string;
  description: string;
  technologies: string[];
  innovations?: string;
}

/**
 * Generates a 2-3 sentence summary of a hackathon project for judges.
 * Called async (fire-and-forget) when a project is submitted.
 */
export async function generateProjectSummary(
  project: ProjectInput
): Promise<string> {
  const techList = project.technologies.join(", ");
  const innovationsLine = project.innovations
    ? `\nInnovations: ${project.innovations}`
    : "";

  const client = getOpenAIClient();
  const startTime = Date.now();
  const response = await client.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are summarizing hackathon projects for judges. Write exactly 2-3 sentences. Focus on what the project does, the key technology used, and what makes it novel or impactful. Be concise and specific.",
      },
      {
        role: "user",
        content: `Project: ${project.name}\nDescription: ${project.description}\nTechnologies: ${techList}${innovationsLine}`,
      },
    ],
    max_tokens: 150,
    temperature: 0.6,
  });

  logAiUsage({
    category: "project_summaries",
    provider: "openai",
    model: response.model,
    operation: "chat_completion",
    tokensUsed: response.usage?.total_tokens || 0,
    promptTokens: response.usage?.prompt_tokens,
    completionTokens: response.usage?.completion_tokens,
    durationMs: Date.now() - startTime,
  });

  return response.choices[0].message.content?.trim() || "";
}
