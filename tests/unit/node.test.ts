import { describe, it, expect } from "vitest";
import type { Node, Source, ChatMessage, SourceInput } from "@/modules/node/types";

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
});
