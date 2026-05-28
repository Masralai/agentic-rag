import { describe, it, expect } from "vitest";
import { Langbase } from "langbase";
import { CONFIG } from "@/lib/config";
import { PdfParser } from "@/modules/ingestion/parsers/pdf";
import { isLMStudioAvailable } from "@/modules/llm/lmstudio";
import { generate, generateStream } from "@/modules/llm";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const apiKey = process.env.LANGBASE_API_KEY;
const langbase = apiKey ? new Langbase({ apiKey }) : null;

const pdfPath = resolve(__dirname, "../fixtures/QNA.pdf");
const hasPdf = existsSync(pdfPath);

describe.runIf(!!apiKey)("Langbase integration", () => {
  it("connects and lists pipes", async () => {
    const pipes: any[] = await langbase!.pipes.list();
    expect(Array.isArray(pipes)).toBe(true);
    const names = pipes.map((p: any) => p.name);
    expect(names).toContain(CONFIG.PIPE_NAME);
  });

  it("connects and lists memories", async () => {
    const memories: any[] = await langbase!.memories.list();
    expect(Array.isArray(memories)).toBe(true);
    const names = memories.map((m: any) => m.name);
    expect(names).toContain(CONFIG.MEMORY_NAME);
  });

  it("uploads a text document to memory", async () => {
    const result = await langbase!.memories.documents.upload({
      memoryName: CONFIG.MEMORY_NAME,
      contentType: "text/plain",
      documentName: `integration-test-${Date.now()}.txt`,
      document: Buffer.from("Integration test document content."),
    });
    expect(result.ok).toBe(true);
  });

  it("retrieves from memory", async () => {
    const chunks = await langbase!.memories.retrieve({
      query: "integration test",
      topK: 1,
      memory: [{ name: CONFIG.MEMORY_NAME }],
    });
    expect(Array.isArray(chunks)).toBe(true);
  });

  it.skipIf(!process.env.GOOGLE_AI_API_KEY)("runs a simple pipe query", async () => {
    const { completion } = await langbase!.pipes.run({
      name: CONFIG.PIPE_NAME,
      stream: false,
      messages: [{ role: "user", content: "Say hello in one word." }],
      ...(CONFIG.LLM_API_KEY ? { llmKey: CONFIG.LLM_API_KEY } : {}),
    });
    expect(typeof completion).toBe("string");
    expect(completion.length).toBeGreaterThan(0);
  });
});

describe("LLM client", () => {
  it("detects LM Studio availability", async () => {
    const available = await isLMStudioAvailable();
    expect(typeof available).toBe("boolean");
  });

  it.runIf(!!process.env.GOOGLE_AI_API_KEY)("falls back to Langbase for generate", async () => {
    const result = await generate("Say hello in one word.");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe.runIf(hasPdf)("PDF ingestion", () => {
  const parser = new PdfParser();

  it("extracts text from QNA.pdf", async () => {
    const buffer = readFileSync(pdfPath);
    const result = await parser.parse({
      nodeId: "test-node",
      type: "pdf",
      file: buffer,
      fileName: "QNA.pdf",
    });
    expect(result.text.length).toBeGreaterThan(100);
    expect(result.metadata.parser).toBe("pdf");
    expect(result.metadata.pages).toBe(20);
  });

  it("uploads extracted PDF text to memory", async () => {
    if (!apiKey) return;
    const buffer = readFileSync(pdfPath);
    const parsed = await parser.parse({
      nodeId: "test-node",
      type: "pdf",
      file: buffer,
      fileName: "QNA.pdf",
    });
    const result = await langbase!.memories.documents.upload({
      memoryName: CONFIG.MEMORY_NAME,
      contentType: "text/plain",
      documentName: `qna-pdf-${Date.now()}.txt`,
      document: Buffer.from(parsed.text.slice(0, 4000)),
    });
    expect(result.ok).toBe(true);
  }, 15000);
});
