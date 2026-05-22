import type { SourceParser, ParsedContent, SourceInput } from "../types";
import mammoth from "mammoth";

export class DocxParser implements SourceParser {
  async parse(input: SourceInput): Promise<ParsedContent> {
    if (!input.file) throw new Error("DOCX parser requires a file buffer");
    const result = await mammoth.extractRawText({ buffer: input.file });
    return {
      text: result.value,
      metadata: { parser: "docx", fileName: input.fileName },
    };
  }
}
