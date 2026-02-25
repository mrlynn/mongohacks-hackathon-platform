import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface FeedbackInput {
  projectName: string;
  projectDescription: string;
  scores: { criteria: string; score: number; maxScore: number }[];
  overallScore: number;
}

export async function generateFeedback(
  input: FeedbackInput
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a constructive hackathon judge providing actionable feedback. Be encouraging but honest.",
      },
      {
        role: "user",
        content: `Generate constructive feedback for:
Project: ${input.projectName}
Description: ${input.projectDescription}
Scores: ${JSON.stringify(input.scores)}
Overall: ${input.overallScore}

Provide 2-3 paragraphs of feedback covering strengths and areas for improvement.`,
      },
    ],
  });

  return response.choices[0].message.content || "";
}

export async function generateAwardJustification(
  projectName: string,
  category: string,
  scores: number[]
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content: "You are a hackathon awards committee member.",
      },
      {
        role: "user",
        content: `Write a brief justification for awarding "${category}" to "${projectName}" with average scores: ${scores.join(", ")}. Keep it to 2-3 sentences.`,
      },
    ],
  });

  return response.choices[0].message.content || "";
}
