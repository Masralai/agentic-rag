import { describe, it, expect } from "vitest";
import type { Notebook, Source, ChatMessage, SourceInput } from "@/modules/notebook/types";

describe("Notebook types", () => {
  it("validates notebook shape", () => {
    const nb: Notebook = {
      id: "123",
      userId: "user1",
      name: "Test Notebook",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(nb.name).toBe("Test Notebook");
    expect(nb.userId).toBe("user1");
  });

  it("validates source shape", () => {
    const src: Source = {
      id: "s1",
      notebookId: "nb1",
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
      notebookId: "nb1",
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
      notebookId: "nb1",
      type: "web",
      url: "https://example.com",
    };
    expect(input.type).toBe("web");
    expect(input.url).toBe("https://example.com");
  });
});
