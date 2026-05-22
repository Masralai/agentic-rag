import { chatToStream } from "@/modules/rag";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session.userId) {
    return new Response("Unauthorized", { status: 401 });
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
    },
  });
}
