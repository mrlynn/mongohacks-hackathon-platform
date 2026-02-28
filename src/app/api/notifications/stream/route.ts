import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { NotificationModel } from "@/lib/db/models/Notification";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const encoder = new TextEncoder();
  let lastCount = -1;
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      async function poll() {
        if (closed) return;

        try {
          await connectToDatabase();
          const count = await NotificationModel.countDocuments({
            userId,
            read: false,
          });

          if (count !== lastCount && !closed) {
            lastCount = count;
            try {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ unreadCount: count })}\n\n`)
              );
            } catch {
              closed = true;
              return;
            }
          }
        } catch (error) {
          console.error("SSE poll error:", error);
        }

        if (!closed) {
          setTimeout(poll, 5000);
        }
      }

      // Send initial count immediately
      poll();
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
