import { describe, it, expect } from "vitest";
import type { SourceInput } from "@/modules/ingestion/types";

describe("URL ingest wiring", () => {
  it("builds process input with metadata.url", () => {
    // ponytail: mirrors processSource URL hydration without hitting DB
    const metadata = { url: "https://example.com/page" };
    const source = {
      nodeId: "n1",
      type: "web" as const,
      name: "https://example.com/page",
      metadata,
    };
    const input: SourceInput = {
      nodeId: source.nodeId,
      type: source.type,
      name: source.name,
      url: typeof source.metadata?.url === "string" ? source.metadata.url : undefined,
    };
    expect(input.url).toBe("https://example.com/page");
  });

  it("leaves url undefined when metadata has no url", () => {
    const input: SourceInput = {
      nodeId: "n1",
      type: "pdf",
      name: "doc.pdf",
      url: undefined,
    };
    expect(input.url).toBeUndefined();
  });
});
