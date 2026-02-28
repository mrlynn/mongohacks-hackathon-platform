import { type PipelineStage } from "mongoose";
import { connectToDatabase } from "@/lib/db/connection";
import { RagDocumentModel } from "@/lib/db/models/RagDocument";
import { embedQuery } from "./embeddings";
import type { ChatMessageSource } from "./types";

interface RetrievalResult {
  content: string;
  sources: ChatMessageSource[];
}

interface RetrievedChunk {
  content: string;
  source: {
    title: string;
    url: string;
    section: string;
    category: string;
  };
  score: number;
}

/**
 * Category-based score boost multipliers.
 * Aligns with Algolia search prioritization (Admin:15, Features:12, API:3).
 */
const CATEGORY_BOOST: Record<string, number> = {
  events: 1.6, // Highest priority - live event data
  admin: 1.5, // Admin guides
  "getting-started": 1.4, // Getting started tutorials
  features: 1.2, // Feature documentation
  ai: 1.1, // AI features
  docs: 1.0, // General documentation
  api: 0.3, // Lowest priority - only when explicitly requested
};

/**
 * Check if query explicitly requests API documentation.
 */
function isApiQuery(query: string): boolean {
  const apiKeywords = /\b(api|endpoint|route|rest|http|post|get|put|delete|integration)\b/i;
  return apiKeywords.test(query);
}

/**
 * Check if query is about events.
 */
function isEventQuery(query: string): boolean {
  const eventKeywords = /\b(event|hackathon|schedule|country|countries|location|venue|date|when|where|register|registration|upcoming|capacity)\b/i;
  return eventKeywords.test(query);
}

/**
 * Apply category-based score boosting to prioritize UI docs over API docs.
 */
function applyScoreBoosting(chunks: RetrievedChunk[], query: string): RetrievedChunk[] {
  const isApi = isApiQuery(query);
  const isEvent = isEventQuery(query);

  return chunks.map((chunk) => {
    const category = chunk.source.category.toLowerCase();
    let boost = CATEGORY_BOOST[category] ?? 1.0;

    // If not an API query, further reduce API doc scores
    if (category === "api" && !isApi) {
      boost = 0.15; // Extra penalty for API docs when not explicitly requested
    }

    // Extra boost for event data when query is event-related
    if (category === "events" && isEvent) {
      boost *= 1.3;
    }

    return {
      ...chunk,
      score: chunk.score * boost,
    };
  });
}

/**
 * Retrieve relevant document chunks for a user query.
 * Applies access-level filtering based on authentication state.
 */
export async function retrieveContext(
  query: string,
  options: {
    isAuthenticated: boolean;
    category?: string;
    topK?: number;
    scoreThreshold?: number;
  }
): Promise<RetrievalResult> {
  await connectToDatabase();

  // Use a higher topK for event queries to ensure all relevant events are included
  const defaultTopK = isEventQuery(query) ? 10 : 5;
  const topK = options.topK ?? defaultTopK;
  const scoreThreshold = options.scoreThreshold ?? 0.7;

  // Generate query embedding
  const queryEmbedding = await embedQuery(query);

  // Build filter for vector search
  const filter: Record<string, unknown> = {};

  // Access level: anonymous users only get public content
  if (!options.isAuthenticated) {
    filter["accessLevel"] = "public";
  }

  if (options.category) {
    filter["source.category"] = options.category;
  }

  // Run $vectorSearch aggregation
  // Fetch more candidates to allow for re-ranking after boosting
  const candidateMultiplier = isApiQuery(query) ? 20 : 30; // Fetch more for non-API queries
  
  // $vectorSearch is an Atlas-specific stage not in Mongoose's PipelineStage type
  const pipeline: PipelineStage[] = [
    {
      $vectorSearch: {
        index: "rag_document_vector",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: topK * candidateMultiplier,
        limit: topK * 3, // Get 3x results for re-ranking
        ...(Object.keys(filter).length > 0 ? { filter } : {}),
      },
    },
    {
      $project: {
        content: 1,
        source: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ];

  const results = await RagDocumentModel.aggregate<RetrievedChunk>(pipeline);

  // Apply category-based score boosting
  const boosted = applyScoreBoosting(results, query);

  // Re-sort by boosted scores
  boosted.sort((a, b) => b.score - a.score);

  // Take top K after re-ranking
  const topResults = boosted.slice(0, topK);

  // Filter by score threshold (using boosted scores)
  const relevant = topResults.filter((r) => r.score >= scoreThreshold);

  // If nothing meets threshold, return the best result anyway (with a note)
  const chunks = relevant.length > 0 ? relevant : topResults.slice(0, 1);

  // Build context string for LLM
  const contextParts = chunks.map(
    (chunk, i) =>
      `[Source ${i + 1}: ${chunk.source.title} > ${chunk.source.section}]\n${chunk.content}`
  );

  const sources: ChatMessageSource[] = chunks.map((chunk) => ({
    title: chunk.source.title,
    url: chunk.source.url,
    section: chunk.source.section,
    relevanceScore: chunk.score,
  }));

  // Deduplicate sources by URL + section
  const uniqueSources = deduplicateSources(sources);

  return {
    content: contextParts.join("\n\n---\n\n"),
    sources: uniqueSources,
  };
}

function deduplicateSources(
  sources: ChatMessageSource[]
): ChatMessageSource[] {
  const seen = new Set<string>();
  return sources.filter((s) => {
    const key = `${s.url}:${s.section}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
