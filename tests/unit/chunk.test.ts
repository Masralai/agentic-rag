import { describe, it, expect } from "vitest";
import { chunkText } from "@/modules/ingestion/chunk";

describe("chunkText", () => {
  it("returns empty array for empty text", () => {
    expect(chunkText("")).toEqual([]);
  });

  it("returns single chunk for text under chunk size", () => {
    const text = "Short document content.";
    expect(chunkText(text)).toEqual([text]);
  });

  it("splits text into multiple chunks with overlap", () => {
    const text = "A".repeat(2500);
    const chunks = chunkText(text);

    expect(chunks.length).toBeGreaterThanOrEqual(3);
    expect(chunks[0].length).toBe(1000);
    expect(chunks[1].length).toBe(1000);

    const overlap = chunks[0].slice(-200);
    expect(chunks[1].slice(0, 200)).toBe(overlap);
  });

  it("last chunk may be shorter than chunk size", () => {
    const text = "A".repeat(1100);
    const chunks = chunkText(text);

    expect(chunks.length).toBe(2);
    expect(chunks[0].length).toBe(1000);
    expect(chunks[1].length).toBe(300);
  });

  it("preserves full content across chunks", () => {
    const text = "B".repeat(2500);
    const chunks = chunkText(text);
    const rejoined = chunks.join("");

    expect(rejoined.length).toBeGreaterThanOrEqual(2500);
    expect(rejoined).toContain(text);
  });
});
