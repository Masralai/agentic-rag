import type { SourceParser, ParsedContent, SourceInput } from "../types";
import * as XLSX from "xlsx";

export class XlsxParser implements SourceParser {
  async parse(input: SourceInput): Promise<ParsedContent> {
    if (!input.file) throw new Error("XLSX parser requires a file buffer");
    const workbook = XLSX.read(input.file, { type: "buffer" });
    const sheets: string[] = [];

    for (const name of workbook.SheetNames) {
      const sheet = workbook.Sheets[name];
      const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
      sheets.push(`--- Sheet: ${name} ---\n${csv}`);
    }

    return {
      text: sheets.join("\n\n"),
      metadata: {
        parser: "xlsx",
        fileName: input.fileName,
        sheets: workbook.SheetNames,
        sheetCount: workbook.SheetNames.length,
      },
    };
  }
}
