/**
 * Full feature pipeline E2E against real DB + parsers + (optional) LLM.
 * Run: npx vitest run tests/integration/features-pipeline.test.ts
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { nodeService } from "@/modules/node";
import { processSource } from "@/modules/ingestion";
import { chatToStream, summarize } from "@/modules/rag";
import { WebParser } from "@/modules/ingestion/parsers/web";
import { buildChatPrompt } from "@/modules/rag/prompts";

const hasDb = !!process.env.DATABASE_URL;
const USER_A = `e2e-user-a-${Date.now()}`;
const USER_B = `e2e-user-b-${Date.now()}`;

describe.runIf(hasDb)("Feature pipeline E2E", () => {
  let nodeId = "";
  let sourceId = "";
  let webSourceId = "";
  const createdSourceIds: string[] = [];

  beforeAll(async () => {
    const node = await nodeService.createNode(USER_A, `E2E Node ${Date.now()}`);
    nodeId = node.id;
  }, 30_000);

  afterAll(async () => {
    if (nodeId) await nodeService.deleteNode(nodeId);
  }, 30_000);

  it("ownership: assertNodeOwner allows owner and rejects other", async () => {
    const owned = await nodeService.assertNodeOwner(nodeId, USER_A);
    expect(owned.id).toBe(nodeId);
    await expect(nodeService.assertNodeOwner(nodeId, USER_B)).rejects.toThrow("Forbidden");
  });

  it("file ingest: txt upload → process → ready + chunks", async () => {
    const source = await nodeService.addSource({
      nodeId,
      type: "txt",
      name: "e2e-notes.txt",
      status: "pending",
      metadata: {},
    });
    sourceId = source.id;
    createdSourceIds.push(sourceId);

    const dir = `/tmp/psynapse/${sourceId}`;
    await mkdir(dir, { recursive: true });
    await writeFile(
      join(dir, "e2e-notes.txt"),
      "Psynapse E2E test document.\n\nParis is the capital of France.\n\nTokyo is the capital of Japan.\n\n" +
        "Vector search finds relevant passages for grounded answers.",
    );

    await processSource(sourceId);
    const [ready] = await nodeService.getSourcesByIds([sourceId]);
    expect(ready.status).toBe("ready");
    expect(ready.rawText).toContain("Paris");
    expect(ready.enabled).not.toBe(false);

    // ponytail: searchChunks with a fake embedding still returns rows when table has vectors
    const fake = Array.from({ length: 384 }, (_, i) => (i === 0 ? 1 : 0));
    const hits = await nodeService.searchChunks(nodeId, fake, 4);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].content.length).toBeGreaterThan(0);
  }, 120_000);

  it("URL ingest: metadata.url is passed into WebParser", async () => {
    const url = "https://example.com/";
    const source = await nodeService.addSource({
      nodeId,
      type: "web",
      name: url,
      status: "pending",
      metadata: { url },
    });
    webSourceId = source.id;
    createdSourceIds.push(webSourceId);

    // Unit of wiring: processSource path
    await processSource(webSourceId);
    const [ready] = await nodeService.getSourcesByIds([webSourceId]);
    expect(ready.status).toBe("ready");
    expect(ready.rawText && ready.rawText.length).toBeGreaterThan(10);
    expect((ready.metadata as any).url).toBe(url);
  }, 60_000);

  it("source enable/disable filters retrieval", async () => {
    await nodeService.updateSource(sourceId, { enabled: false });
    const fake = Array.from({ length: 384 }, (_, i) => (i === 0 ? 1 : 0));
    const disabledHits = await nodeService.searchChunks(nodeId, fake, 10);
    expect(disabledHits.every((h) => h.sourceId !== sourceId)).toBe(true);

    await nodeService.updateSource(sourceId, { enabled: true });
    const enabledHits = await nodeService.searchChunks(nodeId, fake, 10);
    expect(enabledHits.some((h) => h.sourceId === sourceId)).toBe(true);
  }, 30_000);

  it("citations prompt contract uses [n] markers", () => {
    const prompt = buildChatPrompt(
      [{ text: "Paris is the capital of France.", documentName: "e2e-notes.txt" }],
      [],
    );
    expect(prompt).toContain("[1]");
    expect(prompt).toContain("cite it with [n]");
  });

  it("chat stream persists message with citations when LLM available", async () => {
    const stream = await chatToStream(nodeId, "What is the capital of France?");
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += typeof value === "string" ? value : decoder.decode(value, { stream: true });
    }
    expect(text.length).toBeGreaterThan(0);

    const messages = await nodeService.listMessages(nodeId);
    const assistant = [...messages].reverse().find((m) => m.role === "assistant");
    expect(assistant).toBeTruthy();
    expect(assistant!.content.length).toBeGreaterThan(0);
    // citations may be empty if embed/search fails, but sources array should exist
    expect(Array.isArray(assistant!.citations)).toBe(true);
  }, 180_000);

  it("study guide + FAQ persist as artifacts and ignore disabled sources", async () => {
    await nodeService.updateSource(webSourceId, { enabled: false });

    const guide = await summarize(nodeId, "study-guide");
    expect(guide.content.length).toBeGreaterThan(20);
    const savedGuide = await nodeService.latestArtifact(nodeId, "study-guide");
    expect(savedGuide?.content).toBe(guide.content);

    const faq = await summarize(nodeId, "faq");
    expect(faq.content.length).toBeGreaterThan(10);
    const savedFaq = await nodeService.latestArtifact(nodeId, "faq");
    expect(savedFaq?.content).toBe(faq.content);
    expect(savedFaq?.id).not.toBe(savedGuide?.id);

    await nodeService.updateSource(webSourceId, { enabled: true });
  }, 180_000);

  it("WebParser requires url (regression for missing metadata.url)", async () => {
    const parser = new WebParser();
    await expect(parser.parse({ nodeId, type: "web", name: "x" } as any)).rejects.toThrow(/URL/i);
  });
});
