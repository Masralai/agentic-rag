import { summarize, type SummaryType } from "@/modules/rag";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session.userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { notebookId, type } = await req.json();

  if (!notebookId || !type) {
    return new Response("Missing notebookId or type", { status: 400 });
  }

  const result = await summarize(notebookId, type as SummaryType);

  return Response.json(result);
}
