import OpenAI from "openai";
import { logAiUsage } from "./usage-logger";

let openai: OpenAI;
function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const startTime = Date.now();
  const response = await getOpenAI().embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  logAiUsage({
    category: "skill_embeddings",
    provider: "openai",
    model: "text-embedding-3-small",
    operation: "embedding",
    tokensUsed: response.usage?.total_tokens || 0,
    promptTokens: response.usage?.prompt_tokens,
    durationMs: Date.now() - startTime,
  });

  return response.data[0].embedding;
}

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const startTime = Date.now();
  const response = await getOpenAI().embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });

  logAiUsage({
    category: "skill_embeddings",
    provider: "openai",
    model: "text-embedding-3-small",
    operation: "embedding",
    tokensUsed: response.usage?.total_tokens || 0,
    promptTokens: response.usage?.prompt_tokens,
    durationMs: Date.now() - startTime,
    metadata: { batchSize: texts.length },
  });

  return response.data.map((d) => d.embedding);
}
