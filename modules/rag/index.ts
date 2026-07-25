import type { Summary, SummaryType } from "./types";
import { buildChatPrompt, buildSummaryPrompt } from "./prompts";
import { nodeService } from "@/modules/node";
import type { Citation } from "@/modules/node";
import { embed } from "@/modules/llm/embed";
import { generate, generateStream } from "@/modules/llm";

export type { Summary, SummaryType } from "./types";

const SUMMARY_CHAR_BUDGET = 24_000;

export async function chatToStream(
  nodeId: string,
  query: string,
): Promise<ReadableStream> {
  const encoder = new TextEncoder();

  const history = await nodeService.listMessages(nodeId);
  const recentHistory = history.slice(-10);

  let chunks: { text: string; documentName?: string }[] = [];
  const sourceIds: string[] = [];
  const citations: Citation[] = [];

  try {
    const queryEmbedding = await embed(query);
    if (queryEmbedding.length > 0) {
      const results = await nodeService.searchChunks(nodeId, queryEmbedding, 6);
      chunks = results.map((c, i) => {
        if (c.sourceId && !sourceIds.includes(c.sourceId)) {
          sourceIds.push(c.sourceId);
        }
        citations.push({
          index: i + 1,
          sourceId: c.sourceId,
          sourceName: c.sourceName || "Unknown",
          snippet: c.content.slice(0, 240),
        });
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
        await nodeService.addMessage(nodeId, "assistant", fullResponse, sourceIds, citations);
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
  const sources = (await nodeService.listSources(nodeId)).filter(
    (s) => s.status === "ready" && s.enabled !== false,
  );

  // ponytail: cap total chars instead of unbounded rawText join
  const sourceTexts: { name: string; text: string }[] = [];
  let used = 0;
  for (const s of sources) {
    const text = (await nodeService.getSourceContent(s.id)) || "";
    if (!text) continue;
    const room = SUMMARY_CHAR_BUDGET - used;
    if (room <= 0) break;
    const clipped = text.slice(0, room);
    sourceTexts.push({ name: s.name, text: clipped });
    used += clipped.length;
  }

  const prompt = buildSummaryPrompt(sourceTexts, type);
  const content = await generate(prompt);

  // ponytail: retry once — Neon sometimes drops after long LLM calls
  let saved;
  try {
    saved = await nodeService.addArtifact(nodeId, type, content || "");
  } catch {
    saved = await nodeService.addArtifact(nodeId, type, content || "");
  }

  return {
    id: saved.id,
    nodeId,
    type,
    content: content || "",
    createdAt: saved.createdAt,
  };
}
