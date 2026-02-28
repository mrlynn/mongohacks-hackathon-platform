import type { EmbeddingResult, VoyageInputType } from "./types";
import { logAiUsage } from "@/lib/ai/usage-logger";

const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_BATCH_SIZE = 128;

// Voyage 4 shared embedding space:
// - voyage-4-large for document ingestion (highest quality)
// - voyage-4-lite or voyage-4 can be used for queries (cheaper, same space)
const DOCUMENT_MODEL = "voyage-4-large";
const QUERY_MODEL = "voyage-4-large"; // can downgrade to voyage-4 or voyage-4-lite

function getApiKey(): string {
  const key = process.env.VOYAGE_API_KEY;
  if (!key) {
    throw new Error(
      "VOYAGE_API_KEY is not set. Add it to .env.local."
    );
  }
  return key;
}

interface VoyageEmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    total_tokens: number;
  };
}

async function callVoyageAPI(
  texts: string[],
  inputType: VoyageInputType,
  model: string
): Promise<VoyageEmbeddingResponse> {
  const response = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      input: texts,
      model,
      input_type: inputType,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Voyage API error (${response.status}): ${error}`);
  }

  return response.json();
}

/**
 * Generate embeddings for document chunks during ingestion.
 * Uses voyage-4-large for highest quality.
 * Handles batching automatically for large inputs.
 */
export async function embedDocuments(
  texts: string[]
): Promise<EmbeddingResult> {
  if (texts.length === 0) {
    return { embeddings: [], totalTokens: 0 };
  }

  const allEmbeddings: number[][] = [];
  let totalTokens = 0;
  const startTime = Date.now();

  for (let i = 0; i < texts.length; i += VOYAGE_BATCH_SIZE) {
    const batch = texts.slice(i, i + VOYAGE_BATCH_SIZE);
    const response = await callVoyageAPI(batch, "document", DOCUMENT_MODEL);

    // Sort by index to maintain order
    const sorted = response.data.sort((a, b) => a.index - b.index);
    allEmbeddings.push(...sorted.map((d) => d.embedding));
    totalTokens += response.usage.total_tokens;
  }

  logAiUsage({
    category: "rag_embeddings",
    provider: "voyage",
    model: DOCUMENT_MODEL,
    operation: "embedding",
    tokensUsed: totalTokens,
    durationMs: Date.now() - startTime,
    metadata: { batchSize: texts.length, inputType: "document" },
  });

  return { embeddings: allEmbeddings, totalTokens };
}

/**
 * Generate an embedding for a user query.
 * Uses the query model (can be a lighter Voyage 4 variant in the shared space).
 */
export async function embedQuery(text: string): Promise<number[]> {
  const startTime = Date.now();
  const response = await callVoyageAPI([text], "query", QUERY_MODEL);

  logAiUsage({
    category: "rag_embeddings",
    provider: "voyage",
    model: QUERY_MODEL,
    operation: "embedding",
    tokensUsed: response.usage.total_tokens,
    durationMs: Date.now() - startTime,
    metadata: { inputType: "query" },
  });

  return response.data[0].embedding;
}
