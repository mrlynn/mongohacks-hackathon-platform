import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { retrieveContext } from "@/lib/rag/retrieval";
import { streamChatCompletion } from "@/lib/rag/chat";
import {
  getOrCreateSession,
  appendUserMessage,
  appendAssistantMessage,
  getConversationHistory,
} from "@/lib/rag/session";
import { checkRateLimit } from "@/lib/rag/rate-limit";
import type { ChatMessageSource } from "@/lib/rag/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, category } = body as {
      message?: string;
      sessionId?: string;
      category?: string;
    };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return Response.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return Response.json(
        { error: "Message must be under 2000 characters" },
        { status: 400 }
      );
    }

    // Check authentication
    const session = await auth();
    const userId = (session?.user as { id?: string })?.id;
    const isAuthenticated = !!userId;

    // Rate limit by session ID or generate one
    const rateLimitKey = sessionId || "anon-" + getClientIP(request);
    const rateCheck = checkRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      return Response.json(
        {
          error: "Rate limit exceeded. Please wait before sending more messages.",
          retryAfterMs: rateCheck.retryAfterMs,
        },
        { status: 429 }
      );
    }

    // Get or create conversation session
    const { conversation, sessionId: resolvedSessionId } =
      await getOrCreateSession(sessionId, userId, {
        page: body.page || "",
        userAgent: request.headers.get("user-agent") || "",
      });

    // Save user message
    await appendUserMessage(resolvedSessionId, message.trim());

    // Get conversation history for context
    const history = await getConversationHistory(resolvedSessionId, 10);
    // Exclude the message we just added (it's the current turn)
    const previousMessages = history.slice(0, -1);

    // Retrieve relevant context from RAG
    const { content: context, sources } = await retrieveContext(
      message.trim(),
      {
        isAuthenticated,
        category,
      }
    );

    // Stream the response using SSE
    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send sources first
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "sources", sources })}\n\n`
            )
          );

          // Stream LLM response
          const chatStream = streamChatCompletion({
            context,
            userMessage: message.trim(),
            conversationHistory: previousMessages,
            isAuthenticated,
          });

          for await (const chunk of chatStream) {
            fullResponse += chunk;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "chunk", content: chunk })}\n\n`
              )
            );
          }

          // Send done event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "done",
                sessionId: resolvedSessionId,
              })}\n\n`
            )
          );

          // Persist the assistant response
          await appendAssistantMessage(
            resolvedSessionId,
            fullResponse,
            sources
          );

          controller.close();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: "Failed to generate response. Please try again.",
              })}\n\n`
            )
          );
          controller.close();
          console.error("Chat stream error:", errorMessage);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Chat-Session-Id": resolvedSessionId,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
