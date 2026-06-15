import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { nodeService } from "@/modules/node";
import { processSource } from "@/modules/ingestion";
import { existsSync, mkdirSync, writeFileSync, readdirSync, unlinkSync, rmdirSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

const hasDb = !!process.env.DATABASE_URL;

const TEMP_ROOT = "/tmp/psynapse";

describe.runIf(hasDb)("processSource", () => {
  const testUserId = `test-user-${randomUUID().slice(0, 8)}`;
  let testNodeId: string;
  let cleanupIds: string[] = [];

  beforeAll(async () => {
    const node = await nodeService.createNode(testUserId, "processSource-test-node");
    testNodeId = node.id;
  });

  afterAll(async () => {
    for (const id of cleanupIds) {
      const dir = join(TEMP_ROOT, id);
      if (existsSync(dir)) {
        const files = readdirSync(dir);
        for (const f of files) unlinkSync(join(dir, f));
        rmdirSync(dir);
      }
    }
    if (testNodeId) await nodeService.deleteNode(testNodeId);
  });

  it("processes a text source through the full pipeline", async () => {
    const source = await nodeService.addSource({
      nodeId: testNodeId,
      type: "txt",
      name: `test-ingestion-${randomUUID().slice(0, 8)}.txt`,
      status: "pending",
    } as any);
    cleanupIds.push(source.id);

    const dir = join(TEMP_ROOT, source.id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, source.name), "Hello, this is a test document for ingestion pipeline.");

    await processSource(source.id);

    const sources = await nodeService.getSourcesByIds([source.id]);
    const s = sources[0];
    expect(s.status).toBe("ready");
    expect(s.rawText).toContain("test document for ingestion");
    expect(s.metadata).toBeDefined();
    expect(existsSync(dir)).toBe(false);
  }, 30000);

  it("sets status to failed when parsing errors", async () => {
    const source = await nodeService.addSource({
      nodeId: testNodeId,
      type: "txt",
      name: `test-fail-${randomUUID().slice(0, 8)}.txt`,
      status: "pending",
    } as any);
    cleanupIds.push(source.id);

    await expect(processSource(source.id)).rejects.toThrow();

    const sources = await nodeService.getSourcesByIds([source.id]);
    expect(sources[0].status).toBe("failed");
  }, 15000);

  it("rejects non-existent source IDs", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    await expect(processSource(fakeId)).rejects.toThrow("Source not found");
  });
});
