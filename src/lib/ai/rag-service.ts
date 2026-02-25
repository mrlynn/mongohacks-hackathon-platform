import OpenAI from "openai";
import type { Project } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RAGContext {
  eventRules: string;
  judgingCriteria: string;
  similarProjects: Project[];
  historicalFeedback: string[];
}

interface AnalysisResult {
  summary: string;
  highlights: string[];
  concerns: string[];
}

export async function analyzeProjectWithRAG(
  project: Project,
  context: RAGContext
): Promise<AnalysisResult> {
  const systemPrompt = `You are an expert hackathon judge. Analyze projects based on:
- Event Rules: ${context.eventRules}
- Judging Criteria: ${context.judgingCriteria}
- Similar Past Projects: ${JSON.stringify(context.similarProjects.map((p) => p.name))}

Provide your response as JSON with keys: summary (string), highlights (string[]), concerns (string[]).`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Analyze this project:\nName: ${project.name}\nDescription: ${project.description}\nTechnologies: ${project.technologies.join(", ")}\nInnovations: ${project.innovations}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  return JSON.parse(content || '{"summary":"","highlights":[],"concerns":[]}');
}
