import { AiUsageLogModel } from "@/lib/db/models/AiUsageLog";
import type { AiCategory, AiProvider, AiOperation } from "@/lib/db/models/AiUsageLog";
import { connectToDatabase } from "@/lib/db/connection";

// Approximate cost per 1M tokens (USD) — input/output blended averages
const MODEL_COST_PER_MILLION: Record<string, number> = {
  "gpt-4o": 7.5, // ~$2.50 input + $10 output, blended
  "gpt-4-turbo": 20, // ~$10 input + $30 output, blended
  "text-embedding-3-small": 0.02,
  "voyage-4-large": 0.12,
  "voyage-4": 0.1,
  "voyage-4-lite": 0.05,
};

function estimateCost(model: string, tokens: number): number {
  const rate = MODEL_COST_PER_MILLION[model] ?? 5; // default fallback
  return (tokens / 1_000_000) * rate;
}

interface LogAiUsageParams {
  category: AiCategory;
  provider: AiProvider;
  model: string;
  operation: AiOperation;
  tokensUsed: number;
  promptTokens?: number;
  completionTokens?: number;
  durationMs: number;
  userId?: string;
  eventId?: string;
  metadata?: Record<string, unknown>;
  error?: boolean;
}

/**
 * Fire-and-forget AI usage logger.
 * Never throws — errors are logged to console silently.
 */
export function logAiUsage(params: LogAiUsageParams): void {
  const cost = estimateCost(params.model, params.tokensUsed);

  connectToDatabase()
    .then(() =>
      AiUsageLogModel.create({
        category: params.category,
        provider: params.provider,
        model: params.model,
        operation: params.operation,
        tokensUsed: params.tokensUsed,
        promptTokens: params.promptTokens,
        completionTokens: params.completionTokens,
        estimatedCost: cost,
        durationMs: params.durationMs,
        userId: params.userId || undefined,
        eventId: params.eventId || undefined,
        metadata: params.metadata,
        error: params.error ?? false,
      })
    )
    .catch((err) => {
      console.error("[AI Usage Logger] Failed to log:", err.message);
    });
}
