import OpenAI from "openai";
import { logAiUsage } from "./usage-logger";

let openai: OpenAI;
function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

interface JudgeScore {
  innovation: number;
  technical: number;
  impact: number;
  presentation: number;
  comments?: string;
}

interface FeedbackInput {
  projectName: string;
  projectDescription: string;
  technologies: string[];
  innovations?: string;
  judgeScores: JudgeScore[];
}

/**
 * Synthesizes multiple judge scores and comments into a single constructive
 * feedback paragraph for the team. Called after judging concludes.
 */
export async function synthesizeJudgeFeedback(
  input: FeedbackInput
): Promise<string> {
  const { projectName, projectDescription, technologies, innovations, judgeScores } = input;

  const count = judgeScores.length;
  const avg = (key: keyof JudgeScore) =>
    (
      (judgeScores.reduce((sum, s) => sum + (s[key] as number), 0) / count) *
      10
    ) /
    10;

  const avgScores = {
    innovation: avg("innovation"),
    technical: avg("technical"),
    impact: avg("impact"),
    presentation: avg("presentation"),
  };

  const comments = judgeScores
    .filter((s) => s.comments?.trim())
    .map((s) => `- ${s.comments!.trim()}`)
    .join("\n");

  const startTime = Date.now();
  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are synthesizing judge feedback for a hackathon team. Combine the judge scores and comments into 2-3 constructive paragraphs. Acknowledge strengths genuinely, give specific and actionable improvement suggestions, and end on an encouraging note. Do not use bullet points — write in flowing prose.",
      },
      {
        role: "user",
        content: `Project: ${projectName}
Description: ${projectDescription}
Technologies: ${technologies.join(", ")}
${innovations ? `Innovations: ${innovations}` : ""}

Average judge scores (out of 10):
- Innovation: ${avgScores.innovation}
- Technical depth: ${avgScores.technical}
- Impact / usefulness: ${avgScores.impact}
- Presentation / clarity: ${avgScores.presentation}

Judge written comments:
${comments || "(No written comments submitted)"}

Write synthesized feedback for the team.`,
      },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  logAiUsage({
    category: "judge_feedback",
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
