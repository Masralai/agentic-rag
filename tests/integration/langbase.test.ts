import { describe, it, expect } from "vitest";
import { Langbase } from "langbase";
import { CONFIG } from "@/lib/config";
import { PdfParser } from "@/modules/ingestion/parsers/pdf";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { PDFDocument, StandardFonts } from "pdf-lib";

const apiKey = process.env.LANGBASE_API_KEY;
const langbase = apiKey ? new Langbase({ apiKey }) : null;

const pdfPath = resolve(__dirname, "../fixtures/QNA.pdf");
const hasPdf = existsSync(pdfPath);

describe.runIf(!!apiKey)("Langbase pipes (LLM fallback)", () => {
  it("connects and lists pipes", async () => {
    const pipes: any[] = await langbase!.pipes.list();
    expect(Array.isArray(pipes)).toBe(true);
    const names = pipes.map((p: any) => p.name);
    expect(names).toContain(CONFIG.PIPE_NAME);
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

  it("fires onProgress callback during OCR for minimal-text PDF", async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([100, 100]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    page.drawText("ab", { x: 10, y: 50, size: 12, font });
    const pdfBytes = await pdfDoc.save();

    const progressCalls: { current: number; total: number; phase: string }[] = [];
    await parser.parse({
      nodeId: "test-node",
      type: "pdf",
      file: Buffer.from(pdfBytes),
      fileName: "minimal.pdf",
    }, {
      onProgress: (current, total, phase) => {
        progressCalls.push({ current, total, phase });
      },
    });

    expect(progressCalls.length).toBeGreaterThan(0);
    const last = progressCalls[progressCalls.length - 1];
    expect(last.current).toBe(last.total);
    expect(last.phase).toContain("OCR");
  }, 60000);

  it("does not fire onProgress for text-extractable PDF", async () => {
    const buffer = readFileSync(pdfPath);
    const progressCalls: any[] = [];
    await parser.parse({
      nodeId: "test-node",
      type: "pdf",
      file: buffer,
      fileName: "QNA.pdf",
    }, {
      onProgress: (current, total, phase) => {
        progressCalls.push({ current, total, phase });
      },
    });

    expect(progressCalls.length).toBe(0);
  });
});
