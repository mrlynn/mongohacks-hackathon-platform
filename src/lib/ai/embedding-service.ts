import { generateEmbeddings as providerGenerateEmbeddings } from "./provider";
import { logAiUsage } from "./usage-logger";

export async function generateEmbedding(text: string): Promise<number[]> {
  const startTime = Date.now();
  const result = await providerGenerateEmbeddings({ input: text });

  logAiUsage({
    category: "skill_embeddings",
    provider: "openai",
    model: result.model,
    operation: "embedding",
    tokensUsed: result.usage.totalTokens,
    promptTokens: result.usage.promptTokens,
    durationMs: Date.now() - startTime,
  });

  return result.embeddings[0];
}

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const startTime = Date.now();
  const result = await providerGenerateEmbeddings({ input: texts });

  logAiUsage({
    category: "skill_embeddings",
    provider: "openai",
    model: result.model,
    operation: "embedding",
    tokensUsed: result.usage.totalTokens,
    promptTokens: result.usage.promptTokens,
    durationMs: Date.now() - startTime,
    metadata: { batchSize: texts.length },
  });

  return result.embeddings;
}
