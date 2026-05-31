import { vi, describe, it, expect, beforeAll, afterAll } from "vitest";
import { nodeService } from "@/modules/node";
import { randomUUID } from "crypto";

vi.mock("@/modules/llm", () => ({
  generate: vi.fn().mockResolvedValue("Mocked summary response."),
  generateStream: vi.fn().mockResolvedValue(
    new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("Mocked stream response."));
        controller.close();
      },
    }),
  ),
}));

vi.mock("@/modules/llm/embed", () => ({
  embed: vi.fn().mockResolvedValue(
    Array.from({ length: 384 }, (_, i) => (i === 3 ? 1 : 0)),
  ),
  embedBatch: vi.fn().mockResolvedValue([]),
}));

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)("RAG pipeline", () => {
  const testUserId = `rag-test-${randomUUID().slice(0, 8)}`;
  let nodeId: string;
  let sourceId: string;

  beforeAll(async () => {
    const node = await nodeService.createNode(testUserId, "rag-test-node");
    nodeId = node.id;
    const source = await nodeService.addSource({
      nodeId,
      type: "txt",
      name: "rag-source.txt",
      status: "ready",
      rawText: "Paris is the capital of France. Tokyo is the capital of Japan.",
    } as any);
    sourceId = source.id;

    await nodeService.addChunks(sourceId, nodeId, [
      { index: 0, content: "Paris is the capital of France.", embedding: Array.from({ length: 384 }, (_, i) => (i === 3 ? 0.95 : 0)) },
      { index: 1, content: "Tokyo is the capital of Japan.", embedding: Array.from({ length: 384 }, (_, i) => (i === 3 ? 0.1 : 0)) },
    ]);
  });

  afterAll(async () => {
    await nodeService.deleteNode(nodeId);
  });

  describe("chatToStream", () => {
    it("streams a response and saves messages to the database", async () => {
      const { chatToStream } = await import("@/modules/rag");
      const stream = await chatToStream(nodeId, "What is the capital of France?");

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let output = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        output += decoder.decode(value, { stream: true });
      }

      expect(output).toContain("Mocked stream response.");

      const messages = await nodeService.listMessages(nodeId);
      expect(messages.length).toBeGreaterThanOrEqual(2);

      const userMsg = messages.find((m) => m.role === "user");
      expect(userMsg).toBeDefined();
      expect(userMsg!.content).toBe("What is the capital of France?");

      const assistantMsg = messages.find((m) => m.role === "assistant");
      expect(assistantMsg).toBeDefined();
      expect(assistantMsg!.content).toContain("Mocked stream response.");
      expect(assistantMsg!.sources).toContain(sourceId);
    });
  });

  describe("summarize", () => {
    it("generates a summary using source content", async () => {
      const { summarize } = await import("@/modules/rag");
      const summary = await summarize(nodeId, "study-guide");

      expect(summary.nodeId).toBe(nodeId);
      expect(summary.type).toBe("study-guide");
      expect(summary.content).toContain("Mocked summary response.");
      expect(summary.createdAt).toBeInstanceOf(Date);
    });
  });
});
