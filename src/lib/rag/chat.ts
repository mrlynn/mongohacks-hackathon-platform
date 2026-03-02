import type { ChatMessage } from "./types";
import { streamText, type Message } from "@/lib/ai/provider";
import { logAiUsage } from "@/lib/ai/usage-logger";

const AUTHENTICATED_SYSTEM_PROMPT = `You are the MongoHacks Assistant, an AI helper for the MongoHacks hackathon platform.
Answer questions using ONLY the provided context from the MongoHacks documentation and event data.

Rules:
- Be concise and helpful
- **When users ask about events** (dates, locations, countries, themes, capacity, etc.), use the event data provided in the context to give specific, accurate answers
- **Prioritize user-facing UI documentation over API reference docs**:
  * Favor guides for Admin, Getting Started, Features, and AI features
  * Only cite API documentation when the user explicitly asks about "API", "endpoint", "route", or technical integration
  * When both UI and API docs are available, prefer the UI explanation
- Reference specific documentation sections when relevant
- If the context doesn't contain the answer, say so honestly
- Never make up features, events, or capabilities not in the context
- Format responses with markdown for readability
- For code examples, use the languages shown in the docs`;

const ANONYMOUS_SYSTEM_PROMPT = `You are the MongoHacks Assistant, a friendly guide for the MongoHacks hackathon platform.
You help potential participants learn about MongoHacks and encourage them to register.

Rules:
- Be enthusiastic and welcoming
- **When users ask about events** (dates, locations, countries, themes, etc.), use the event data provided in the context to give specific, accurate answers
- **Prioritize user-facing content over technical API docs**:
  * Focus on how-to guides, getting started tutorials, and feature explanations
  * Only mention API endpoints if the user specifically asks about technical integration
  * Explain features from a user's perspective, not a developer's
- Answer questions using ONLY the provided context
- When relevant, encourage users to sign up or register for events
- If asked about features only available to registered users, mention they can access more by creating an account
- Keep responses concise and engaging
- Never make up features, events, or capabilities not in the context`;

interface ChatCompletionOptions {
  context: string;
  userMessage: string;
  conversationHistory: ChatMessage[];
  isAuthenticated: boolean;
}

/**
 * Stream a chat completion from the AI provider.
 * Returns an async iterable of text chunks.
 */
export async function* streamChatCompletion(
  options: ChatCompletionOptions
): AsyncGenerator<string> {
  const { context, userMessage, conversationHistory, isAuthenticated } =
    options;

  const systemPrompt = isAuthenticated
    ? AUTHENTICATED_SYSTEM_PROMPT
    : ANONYMOUS_SYSTEM_PROMPT;

  // Build messages array: system + context + history + current message
  const messages: Message[] = [
    {
      role: "system",
      content: `${systemPrompt}\n\nContext from documentation:\n${context}`,
    },
  ];

  // Add last 10 messages of conversation history
  const recentHistory = conversationHistory.slice(-10);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role as Message["role"],
      content: msg.content,
    });
  }

  // Add current user message
  messages.push({
    role: "user",
    content: userMessage,
  });

  const startTime = Date.now();
  const stream = streamText({
    messages,
    maxTokens: 1024,
    temperature: 0.3,
  });

  let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

  let result = await stream.next();
  while (!result.done) {
    yield result.value;
    result = await stream.next();
  }
  // The return value from the generator contains usage info
  usage = result.value;

  logAiUsage({
    category: "rag_chat",
    provider: "openai",
    model: "gpt-4o",
    operation: "streaming",
    tokensUsed: usage.totalTokens,
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    durationMs: Date.now() - startTime,
  });
}
