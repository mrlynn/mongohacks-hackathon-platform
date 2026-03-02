import { generateText } from "./provider";
import { logAiUsage } from "./usage-logger";

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

  const startTime = Date.now();
  const result = await generateText({
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
    maxTokens: 150,
    temperature: 0.6,
  });

  logAiUsage({
    category: "project_summaries",
    provider: "openai",
    model: result.model,
    operation: "chat_completion",
    tokensUsed: result.usage.totalTokens,
    promptTokens: result.usage.promptTokens,
    completionTokens: result.usage.completionTokens,
    durationMs: Date.now() - startTime,
  });

  return result.content;
}
