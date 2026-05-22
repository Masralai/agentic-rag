import { chatToStream } from "@/modules/rag";
import { auth } from "@clerk/nextjs/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session.userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { allowed, remaining, resetAt } = rateLimit(
    `chat:${session.userId}`,
    { limit: 30, windowMs: 60_000 },
  );
  if (!allowed) {
    return new Response("Too many requests", {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
        "X-RateLimit-Remaining": "0",
      },
    });
  }

  const { notebookId, query } = await req.json();

  if (!notebookId || !query) {
    return new Response("Missing notebookId or query", { status: 400 });
  }

  const stream = await chatToStream(notebookId, query);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-RateLimit-Remaining": String(remaining),
    },
  });
}
