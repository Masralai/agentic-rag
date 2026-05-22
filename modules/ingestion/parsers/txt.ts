import type { SourceParser, ParsedContent, SourceInput } from "../types";

export class TxtParser implements SourceParser {
  async parse(input: SourceInput): Promise<ParsedContent> {
    if (!input.file) throw new Error("TXT parser requires a file buffer");
    return {
      text: input.file.toString("utf-8"),
      metadata: { parser: "txt" },
    };
  }
}
