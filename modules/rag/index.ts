import type { Summary, SummaryType } from "./types";
import { buildChatPrompt, buildSummaryPrompt } from "./prompts";
import { notebookService } from "@/modules/notebook";
import { langbase, fromReadableStream } from "@/lib/langbase";
import { CONFIG } from "@/lib/config";

export type { Summary, SummaryType } from "./types";

export async function chatToStream(
  notebookId: string,
  query: string,
): Promise<ReadableStream> {
  const encoder = new TextEncoder();

  const history = await notebookService.listMessages(notebookId);
  const recentHistory = history.slice(-10);

  const chunks = await langbase.memories.retrieve({
    query,
    topK: 4,
    memory: [{ name: CONFIG.MEMORY_NAME }],
  });

  if (!chunks || chunks.length === 0) {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(JSON.stringify({ type: "no-results" })));
        controller.close();
      },
    });
  }

  await notebookService.addMessage(notebookId, "user", query);

  const systemPrompt = buildChatPrompt(chunks, recentHistory);
  const response = await langbase.pipes.run({
    stream: true,
    name: CONFIG.PIPE_NAME,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: query },
    ],
  });

  const runner = fromReadableStream(response.stream);
  const sources = Array.from(
    new Set(chunks.map((c: any) => c.documentName || c.source || "Unknown")),
  );

  let fullResponse = "";

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of runner) {
          const text = chunk.choices?.[0]?.delta?.content ?? "";
          if (text) {
            fullResponse += text;
            controller.enqueue(encoder.encode(text));
          }
        }

        await notebookService.addMessage(notebookId, "assistant", fullResponse, sources);
        controller.close();
      } catch (error) {
        console.error("RAG stream error:", error);
        controller.enqueue(encoder.encode(JSON.stringify({ type: "error", message: "Stream failed" })));
        controller.close();
      }
    },
  });
}

export async function summarize(
  notebookId: string,
  type: SummaryType,
): Promise<Summary> {
  const sources = await notebookService.listSources(notebookId);
  const sourceTexts = await Promise.all(
    sources
      .filter((s) => s.status === "ready" && s.rawText)
      .map(async (s) => ({
        name: s.name,
        text: (await notebookService.getSourceContent(s.id)) || "",
      })),
  );

  const prompt = buildSummaryPrompt(sourceTexts, type);

  const { completion } = await langbase.pipes.run({
    stream: false,
    name: CONFIG.PIPE_NAME,
    messages: [{ role: "system", content: prompt }],
  });

  return {
    id: crypto.randomUUID(),
    notebookId,
    type,
    content: completion || "",
    createdAt: new Date(),
  };
}
