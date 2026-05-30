import type { Summary, SummaryType } from "./types";
import { buildChatPrompt, buildSummaryPrompt } from "./prompts";
import { nodeService } from "@/modules/node";
import { langbase } from "@/lib/langbase";
import { CONFIG } from "@/lib/config";
import { generate, generateStream } from "@/modules/llm";

export type { Summary, SummaryType } from "./types";

export async function chatToStream(
  nodeId: string,
  query: string,
): Promise<ReadableStream> {
  const encoder = new TextEncoder();

  const history = await nodeService.listMessages(nodeId);
  const recentHistory = history.slice(-10);

  const chunks = await langbase.memories.retrieve({
    query,
    topK: 4,
    memory: [{ name: CONFIG.MEMORY_NAME }],
  });

  await nodeService.addMessage(nodeId, "user", query);

  const systemPrompt = buildChatPrompt(chunks || [], recentHistory);
  const stream = await generateStream(systemPrompt, query);

  const sources = Array.from(
    new Set((chunks || []).map((c: any) => c.documentName || c.source || "Unknown")),
  );
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
        await nodeService.addMessage(nodeId, "assistant", fullResponse, sources);
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
