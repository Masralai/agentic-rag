import { describe, it, expect, beforeEach } from "vitest";
import { TxtParser } from "@/modules/ingestion/parsers/txt";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("Ingestion parsers", () => {
  describe("TxtParser", () => {
    const parser = new TxtParser();
    const fixturePath = resolve(__dirname, "../fixtures/sample.txt");

    it("extracts text from a .txt file", async () => {
      const buffer = readFileSync(fixturePath);
      const result = await parser.parse({
        nodeId: "nb1",
        type: "txt",
        file: buffer,
        fileName: "sample.txt",
      });

      expect(result.text).toContain("Hello, this is a plain text file.");
      expect(result.metadata.parser).toBe("txt");
    });

    it("throws without a file buffer", async () => {
      await expect(
        parser.parse({ nodeId: "nb1", type: "txt" }),
      ).rejects.toThrow("TXT parser requires a file buffer");
    });

    it("handles empty buffer", async () => {
      const result = await parser.parse({
        nodeId: "nb1",
        type: "txt",
        file: Buffer.from(""),
      });
      expect(result.text).toBe("");
    });

    it("handles UTF-8 content", async () => {
      const result = await parser.parse({
        nodeId: "nb1",
        type: "txt",
        file: Buffer.from("café résumé ñoño", "utf-8"),
      });
      expect(result.text).toContain("café");
    });
  });
});
