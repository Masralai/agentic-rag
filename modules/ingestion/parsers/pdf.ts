import type { SourceParser, ParsedContent, SourceInput } from "../types";
import { PDFParse } from "pdf-parse";

export class PdfParser implements SourceParser {
  async parse(input: SourceInput): Promise<ParsedContent> {
    if (!input.file) throw new Error("PDF parser requires a file buffer");

    const pdf = new PDFParse({ data: input.file });
    const textResult = await pdf.getText();

    return {
      text: textResult.text,
      metadata: {
        parser: "pdf",
        fileName: input.fileName,
        pages: textResult.total,
      },
    };
  }
}
