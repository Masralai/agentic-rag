import type { SourceParser, ParsedContent, SourceInput } from "../types";
import pdfParse from "pdf-parse";

export class PdfParser implements SourceParser {
  async parse(input: SourceInput): Promise<ParsedContent> {
    if (!input.file) throw new Error("PDF parser requires a file buffer");
    const data = await pdfParse(input.file);
    return {
      text: data.text,
      metadata: {
        parser: "pdf",
        fileName: input.fileName,
        pages: data.numpages,
      },
    };
  }
}
