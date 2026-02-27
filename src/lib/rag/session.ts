import { randomUUID } from "crypto";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/connection";
import { RagConversationModel } from "@/lib/db/models/RagConversation";
import type { ChatMessage, ChatMessageSource } from "./types";

/**
 * Get or create a conversation session.
 * Returns the conversation document and session ID.
 */
export async function getOrCreateSession(
  sessionId: string | undefined,
  userId: string | undefined,
  metadata: { page: string; userAgent: string }
) {
  await connectToDatabase();

  if (sessionId) {
    const existing = await RagConversationModel.findOne({ sessionId });
    if (existing) {
      return { conversation: existing, sessionId };
    }
  }

  // Create new session
  const newSessionId = sessionId || randomUUID();
  const conversation = await RagConversationModel.create({
    sessionId: newSessionId,
    userId: userId ? new Types.ObjectId(userId) : undefined,
    messages: [],
    metadata,
  });

  return { conversation, sessionId: newSessionId };
}

/**
 * Append a user message to the conversation.
 */
export async function appendUserMessage(
  sessionId: string,
  content: string
): Promise<void> {
  await RagConversationModel.updateOne(
    { sessionId },
    {
      $push: {
        messages: {
          role: "user",
          content,
          createdAt: new Date(),
        },
      },
    }
  );
}

/**
 * Append an assistant message with sources to the conversation.
 */
export async function appendAssistantMessage(
  sessionId: string,
  content: string,
  sources: ChatMessageSource[]
): Promise<void> {
  await RagConversationModel.updateOne(
    { sessionId },
    {
      $push: {
        messages: {
          role: "assistant",
          content,
          sources,
          createdAt: new Date(),
        },
      },
    }
  );
}

/**
 * Get recent conversation history for context.
 */
export async function getConversationHistory(
  sessionId: string,
  limit: number = 10
): Promise<ChatMessage[]> {
  await connectToDatabase();

  const conversation = await RagConversationModel.findOne({ sessionId });
  if (!conversation) return [];

  return conversation.messages.slice(-limit);
}
