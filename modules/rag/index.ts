import type { StreamChunk, Summary, SummaryType } from "./types";
import { langbase } from "@/lib/langbase";
import { CONFIG } from "@/lib/config";

export type { StreamChunk, Summary, SummaryType } from "./types";

export async function* chat(
  notebookId: string,
  query: string,
  history: { role: "user" | "assistant"; content: string }[],
): AsyncGenerator<StreamChunk> {
  try {
    // TODO: Phase 3 — retrieve memory chunks, build prompt with history, stream
    const { completion } = await langbase.pipes.run({
      stream: false,
      name: CONFIG.PIPE_NAME,
      messages: [
        { role: "system", content: "TODO: build system prompt with chunks + history" },
        { role: "user", content: query },
      ],
    });

    yield { type: "token", content: completion };
    yield { type: "done", sources: [] };
  } catch (error) {
    yield { type: "error", error: "Failed to process query." };
  }
}

export async function summarize(
  notebookId: string,
  type: SummaryType,
): Promise<Summary> {
  // TODO: Phase 4 — retrieve all source texts, build summary prompt, call Langbase
  return {
    id: "",
    notebookId,
    type,
    content: "",
    createdAt: new Date(),
  };
}
