import type { SourceParser, ParsedContent, SourceInput } from "../types";
import { PDFParse } from "pdf-parse";
import { createCanvas } from "canvas";
import { createWorker } from "tesseract.js";

export class PdfParser implements SourceParser {
  async parse(input: SourceInput): Promise<ParsedContent> {
    if (!input.file) throw new Error("PDF parser requires a file buffer");

    const textResult = await this.extractText(input.file);
    const pages = textResult.total || 0;

    if (textResult.text.trim().length > 20) {
      return {
        text: textResult.text,
        metadata: { parser: "pdf", fileName: input.fileName, pages },
      };
    }

    const ocrText = await this.ocrPages(input.file);
    return {
      text: ocrText,
      metadata: { parser: "pdf-ocr", fileName: input.fileName, pages },
    };
  }

  private async extractText(buffer: Buffer) {
    const pdf = new PDFParse({ data: buffer });
    try {
      return await pdf.getText();
    } catch (e: any) {
      const msg = e.message || "";
      if (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("encrypted")) {
        throw new Error("This PDF is password-protected. Decrypt it first and try again.");
      }
      throw e;
    }
  }

  private async ocrPages(buffer: Buffer): Promise<string> {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs") as any;
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
    const total = pdf.numPages;
    const worker = await createWorker("eng");
    const results: string[] = [];

    try {
      for (let i = 1; i <= total; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = createCanvas(viewport.width, viewport.height);
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;

        const png = canvas.toBuffer("image/png");
        const { data } = await worker.recognize(png);
        const text = (data.text || "").trim();
        results.push(text ? `--- Page ${i} ---\n${text}` : `--- Page ${i} ---\n[No text detected]`);

        process.stdout.write(`\r   OCR page ${i}/${total}`);
      }
      console.log("");
    } finally {
      await worker.terminate();
    }

    return results.join("\n\n");
  }
}
