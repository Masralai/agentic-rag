import { summarize, type SummaryType } from "@/modules/rag";
import { auth } from "@clerk/nextjs/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session.userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { allowed, remaining, resetAt } = rateLimit(
    `summarize:${session.userId}`,
    { limit: 10, windowMs: 60_000 },
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

  const { nodeId, type } = await req.json();

  if (!nodeId || !type) {
    return new Response("Missing nodeId or type", { status: 400 });
  }

  const result = await summarize(nodeId, type as SummaryType);

  return Response.json(result, {
    headers: { "X-RateLimit-Remaining": String(remaining) },
  });
}
