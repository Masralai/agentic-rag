import type { SourceParser, ParsedContent, SourceInput } from "../types";
import * as XLSX from "xlsx";

export class CsvParser implements SourceParser {
  async parse(input: SourceInput): Promise<ParsedContent> {
    if (!input.file) throw new Error("CSV parser requires a file buffer");
    const text = input.file.toString("utf-8");
    return {
      text,
      metadata: {
        parser: "csv",
        fileName: input.fileName,
        rows: text.trim().split("\n").length,
      },
    };
  }
}
