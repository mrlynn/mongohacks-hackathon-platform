import OpenAI from "openai";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model?: string;
  messages: Message[];
  maxTokens?: number;
  temperature?: number;
}

export interface EmbeddingOptions {
  model?: string;
  input: string | string[];
}

export interface TextResult {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface EmbeddingResult {
  embeddings: number[][];
  model: string;
  usage: {
    totalTokens: number;
    promptTokens?: number;
  };
}

// ─── Client singleton ──────────────────────────────────────────────────────

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

// ─── Defaults ──────────────────────────────────────────────────────────────

function defaultModel(): string {
  return process.env.AI_DEFAULT_MODEL || "gpt-4o";
}

function defaultEmbeddingModel(): string {
  return process.env.AI_EMBEDDING_MODEL || "text-embedding-3-small";
}

// ─── Operations ────────────────────────────────────────────────────────────

/**
 * Non-streaming chat completion. Returns the full response text.
 */
export async function generateText(options: ChatOptions): Promise<TextResult> {
  const ai = getClient();
  const model = options.model || defaultModel();

  const response = await ai.chat.completions.create({
    model,
    messages: options.messages,
    max_tokens: options.maxTokens,
    temperature: options.temperature,
  });

  return {
    content: response.choices[0].message.content?.trim() || "",
    model: response.model,
    usage: {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    },
  };
}

/**
 * Chat completion with JSON response format.
 */
export async function generateJSON(options: ChatOptions): Promise<TextResult> {
  const ai = getClient();
  const model = options.model || defaultModel();

  const response = await ai.chat.completions.create({
    model,
    messages: options.messages,
    max_tokens: options.maxTokens,
    temperature: options.temperature,
    response_format: { type: "json_object" },
  });

  return {
    content: response.choices[0].message.content?.trim() || "",
    model: response.model,
    usage: {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    },
  };
}

/**
 * Streaming chat completion. Yields text chunks as they arrive.
 * After iteration completes, the returned usage is available via the
 * final chunk's usage field (when supported by the model).
 */
export async function* streamText(
  options: ChatOptions
): AsyncGenerator<string, TextResult["usage"]> {
  const ai = getClient();
  const model = options.model || defaultModel();

  const stream = await ai.chat.completions.create({
    model,
    messages: options.messages,
    max_tokens: options.maxTokens,
    temperature: options.temperature,
    stream: true,
    stream_options: { include_usage: true },
  });

  let totalTokens = 0;
  let promptTokens = 0;
  let completionTokens = 0;

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
    if (chunk.usage) {
      totalTokens = chunk.usage.total_tokens;
      promptTokens = chunk.usage.prompt_tokens;
      completionTokens = chunk.usage.completion_tokens;
    }
  }

  return { promptTokens, completionTokens, totalTokens };
}

/**
 * Generate embeddings for one or more inputs.
 * Always returns an array of embedding vectors (even for single input).
 */
export async function generateEmbeddings(
  options: EmbeddingOptions
): Promise<EmbeddingResult> {
  const ai = getClient();
  const model = options.model || defaultEmbeddingModel();

  const response = await ai.embeddings.create({
    model,
    input: options.input,
  });

  return {
    embeddings: response.data.map((d) => d.embedding),
    model,
    usage: {
      totalTokens: response.usage?.total_tokens || 0,
      promptTokens: response.usage?.prompt_tokens,
    },
  };
}
