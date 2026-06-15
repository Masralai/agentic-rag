import type { Summary, SummaryType } from "./types";
import { buildChatPrompt, buildSummaryPrompt } from "./prompts";
import { nodeService } from "@/modules/node";
import { embed } from "@/modules/llm/embed";
import { generate, generateStream } from "@/modules/llm";

export type { Summary, SummaryType } from "./types";

export async function chatToStream(
  nodeId: string,
  query: string,
): Promise<ReadableStream> {
  const encoder = new TextEncoder();

  const history = await nodeService.listMessages(nodeId);
  const recentHistory = history.slice(-10);

  let chunks: { text: string; documentName?: string }[] = [];
  const sourceIds: string[] = [];
  try {
    const queryEmbedding = await embed(query);
    if (queryEmbedding.length > 0) {
      const results = await nodeService.searchChunks(nodeId, queryEmbedding, 4);
      chunks = results.map((c) => {
        if (c.sourceId && !sourceIds.includes(c.sourceId)) {
          sourceIds.push(c.sourceId);
        }
        return { text: c.content, documentName: c.sourceName || "" };
      });
    }
  } catch (error) {
    console.error("Vector search failed, continuing without context:", error);
  }

  await nodeService.addMessage(nodeId, "user", query);

  const systemPrompt = buildChatPrompt(chunks, recentHistory);
  const stream = await generateStream(systemPrompt, query);

  let fullResponse = "";

  const reader = stream.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = typeof value === "string" ? value : decoder.decode(value, { stream: true });
          if (text) {
            fullResponse += text;
            controller.enqueue(encoder.encode(text));
          }
        }
        await nodeService.addMessage(nodeId, "assistant", fullResponse, sourceIds);
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
  nodeId: string,
  type: SummaryType,
): Promise<Summary> {
  const sources = await nodeService.listSources(nodeId);
  const sourceTexts = await Promise.all(
    sources
      .filter((s) => s.status === "ready" && s.rawText)
      .map(async (s) => ({
        name: s.name,
        text: (await nodeService.getSourceContent(s.id)) || "",
      })),
  );

  const prompt = buildSummaryPrompt(sourceTexts, type);
  const content = await generate(prompt);

  return {
    id: crypto.randomUUID(),
    nodeId,
    type,
    content: content || "",
    createdAt: new Date(),
  };
}
