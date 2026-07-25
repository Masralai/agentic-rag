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

  it("splits long continuous text with overlap", () => {
    const text = "A".repeat(2500);
    const chunks = chunkText(text);

    expect(chunks.length).toBeGreaterThanOrEqual(3);
    expect(chunks[0].length).toBe(1000);
    const overlap = chunks[0].slice(-200);
    expect(chunks[1].slice(0, 200)).toBe(overlap);
  });

  it("prefers paragraph boundaries", () => {
    const p1 = "First paragraph. ".repeat(20).trim();
    const p2 = "Second paragraph. ".repeat(20).trim();
    const text = `${p1}\n\n${p2}`;
    const chunks = chunkText(text);
    expect(chunks.some((c) => c.includes("First paragraph"))).toBe(true);
    expect(chunks.some((c) => c.includes("Second paragraph"))).toBe(true);
  });

  it("last chunk may be shorter than chunk size", () => {
    const text = "A".repeat(1100);
    const chunks = chunkText(text);

    expect(chunks.length).toBe(2);
    expect(chunks[0].length).toBe(1000);
    expect(chunks[1].length).toBe(300);
  });
});
