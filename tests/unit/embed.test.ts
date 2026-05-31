import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("@xenova/transformers", () => ({
  // Mock the pipeline function
  pipeline: vi.fn().mockImplementation((task, model) => {
    // Return a mock extractor function
    return vi.fn().mockImplementation((texts, options) => {
      // texts can be string or string[]
      if (typeof texts === "string") {
        // Single text input - return mock embedding
        return Promise.resolve({
          data: new Float32Array(Array.from({ length: 384 }, (_, i) => i / 384))
        });
      } else {
        // Batch input
        const result1 = Array.from({ length: 384 }, () => 0.1);
        const result2 = Array.from({ length: 384 }, () => 0.2);
        return Promise.resolve({
          tolist: () => [result1, result2]
        });
      }
    });
  })
}));

import { embed, embedBatch } from "@/modules/llm/embed";

describe("embed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an embedding vector of length 384", async () => {
    const result = await embed("hello world");
    expect(result).toHaveLength(384);
    // Just check it's a number array, not specific values
    expect(typeof result[0]).toBe("number");
    expect(result[0]).toBeGreaterThanOrEqual(-1);
    expect(result[0]).toBeLessThanOrEqual(1);
  });

  it("returns empty array for empty input", async () => {
    const result = await embed("");
    expect(result).toEqual([]);
  });
});

describe("embedBatch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns embeddings for each input text", async () => {
    const results = await embedBatch(["first", "second"]);
    expect(results).toHaveLength(2);
    expect(results[0]).toHaveLength(384);
    expect(results[1]).toHaveLength(384);
    // Check values are in expected range
    expect(results[0][0]).toBeCloseTo(0.1);
    expect(results[1][0]).toBeCloseTo(0.2);
  });

  it("returns empty array for empty input", async () => {
    const results = await embedBatch([]);
    expect(results).toEqual([]);

    const results2 = await embedBatch(["", ""]);
    expect(results2).toEqual([]);
  });
});
