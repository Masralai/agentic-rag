import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { nodeService } from "@/modules/node";
import { randomUUID } from "crypto";

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)("pgvector chunk round-trip", () => {
  const testUserId = `chunk-test-${randomUUID().slice(0, 8)}`;
  let nodeId: string;
  let sourceIndex = 0;

  beforeAll(async () => {
    const node = await nodeService.createNode(testUserId, "chunk-test-node");
    nodeId = node.id;
  });

  afterAll(async () => {
    await nodeService.deleteNode(nodeId);
  });

  function makeVector(...values: number[]): number[] {
    const vec = Array.from({ length: 384 }, (_, i) => values[i] ?? 0);
    return vec;
  }

  async function createSource(): Promise<string> {
    const idx = ++sourceIndex;
    const source = await nodeService.addSource({
      nodeId,
      type: "txt",
      name: `chunk-test-source-${idx}.txt`,
      status: "ready",
      rawText: "test content",
    } as any);
    return source.id;
  }

  it("stores chunks and retrieves them via vector search", async () => {
    const sourceId = await createSource();
    const catEmbedding = makeVector(1, 0, 0, 0);
    const dogEmbedding = makeVector(0, 0, 1, 0);

    await nodeService.addChunks(sourceId, nodeId, [
      { index: 0, content: "The cat sat on the mat.", embedding: catEmbedding },
      { index: 1, content: "Dogs love to play fetch.", embedding: dogEmbedding },
    ]);

    const queryEmbedding = makeVector(0, 0, 0.95, 0);
    const results = await nodeService.searchChunks(nodeId, queryEmbedding, 5);

    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0].content).toBe("Dogs love to play fetch.");
    results.forEach((r) => {
      expect(r.sourceName).toBeTruthy();
    });
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ content: "The cat sat on the mat." }),
      ]),
    );

    await nodeService.deleteChunksBySource(sourceId);
    await nodeService.removeSource(sourceId);
  });

  it("deletes chunks by source", async () => {
    const sourceId = await createSource();
    await nodeService.addChunks(sourceId, nodeId, [
      { index: 0, content: "Delete me.", embedding: makeVector(0.5, 0.5) },
    ]);

    await nodeService.deleteChunksBySource(sourceId);
    const results = await nodeService.searchChunks(nodeId, makeVector(0.5, 0.5), 10);
    const matching = results.filter((c) => c.content === "Delete me.");
    expect(matching).toHaveLength(0);

    await nodeService.removeSource(sourceId);
  });
});
