import { describe, it, expect } from "vitest";
import type { Node, Source, ChatMessage, SourceInput, ProcessingProgress } from "@/modules/node/types";

describe("Node types", () => {
  it("validates node shape", () => {
    const nb: Node = {
      id: "123",
      userId: "user1",
      name: "Test Node",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(nb.name).toBe("Test Node");
    expect(nb.userId).toBe("user1");
  });

  it("validates source shape", () => {
    const src: Source = {
      id: "s1",
      nodeId: "nb1",
      type: "pdf",
      name: "doc.pdf",
      status: "ready",
      enabled: true,
      metadata: { pages: 5 },
      createdAt: new Date(),
    };
    expect(src.type).toBe("pdf");
    expect(src.status).toBe("ready");
  });

  it("validates chat message shape", () => {
    const msg: ChatMessage = {
      id: "m1",
      nodeId: "nb1",
      role: "user",
      content: "hello",
      sources: [],
      citations: [],
      createdAt: new Date(),
    };
    expect(msg.role).toBe("user");
    expect(msg.content).toBe("hello");
  });

  it("validates source input types", () => {
    const input: SourceInput = {
      nodeId: "nb1",
      type: "web",
      url: "https://example.com",
    };
    expect(input.type).toBe("web");
    expect(input.url).toBe("https://example.com");
  });

  it("validates ProcessingProgress shape", () => {
    const progress: ProcessingProgress = {
      current: 5,
      total: 20,
      phase: "OCR: page 5 of 20",
    };
    expect(progress.current).toBe(5);
    expect(progress.total).toBe(20);
    expect(progress.phase).toContain("OCR");
  });

  it("Source type includes progress field", () => {
    const withProgress: Source = {
      id: "s1",
      nodeId: "nb1",
      type: "pdf",
      name: "scanned.pdf",
      status: "processing",
      enabled: true,
      metadata: {},
      createdAt: new Date(),
      progress: { current: 3, total: 10, phase: "OCR: page 3 of 10" },
    };
    expect(withProgress.progress?.current).toBe(3);
    expect(withProgress.progress?.total).toBe(10);

    const withoutProgress: Source = {
      id: "s2",
      nodeId: "nb1",
      type: "pdf",
      name: "text.pdf",
      status: "ready",
      enabled: true,
      metadata: {},
      createdAt: new Date(),
    };
    expect(withoutProgress.progress).toBeUndefined();
  });
});
