import type { SourceParser, ParsedContent, SourceInput } from "../types";

export class MdParser implements SourceParser {
  async parse(input: SourceInput): Promise<ParsedContent> {
    if (!input.file) throw new Error("MD parser requires a file buffer");
    const text = input.file.toString("utf-8");
    return {
      text,
      metadata: {
        parser: "md",
        fileName: input.fileName,
        size: text.length,
      },
    };
  }
}
