import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { CsvParser } from "@/modules/ingestion/parsers/csv";
import { MdParser } from "@/modules/ingestion/parsers/md";
import { HtmlParser } from "@/modules/ingestion/parsers/html";
import { XlsxParser } from "@/modules/ingestion/parsers/xlsx";
import { DocxParser } from "@/modules/ingestion/parsers/docx";
import { Document, Packer, Paragraph, TextRun } from "docx";
import * as XLSX from "xlsx";

const fixtureDir = resolve(__dirname, "../fixtures");

describe("CsvParser", () => {
  const parser = new CsvParser();

  it("extracts rows from a CSV file", async () => {
    const buffer = readFileSync(resolve(fixtureDir, "sample.csv"));
    const result = await parser.parse({
      nodeId: "nb1", type: "csv", file: buffer, fileName: "sample.csv",
    });
    expect(result.metadata.rows).toBe(6);
    expect(result.text).toContain("Engineering");
    expect(result.text).toContain("Alice Johnson");
    expect(result.metadata.parser).toBe("csv");
  });

  it("throws without a file buffer", async () => {
    await expect(
      parser.parse({ nodeId: "nb1", type: "csv" }),
    ).rejects.toThrow("CSV parser requires a file buffer");
  });

  it("handles empty CSV", async () => {
    const result = await parser.parse({
      nodeId: "nb1", type: "csv", file: Buffer.from(""),
    });
    expect(result.metadata.rows).toBe(1);
  });
});

describe("MdParser", () => {
  const parser = new MdParser();

  it("extracts headings and list items from markdown", async () => {
    const buffer = readFileSync(resolve(fixtureDir, "sample.md"));
    const result = await parser.parse({
      nodeId: "nb1", type: "md", file: buffer, fileName: "sample.md",
    });
    expect(result.text).toContain("Project Documentation");
    expect(result.text).toContain("Feature A");
    expect(result.text).toContain("def hello():");
    expect(result.text).toContain("## Conclusion");
    expect(result.metadata.parser).toBe("md");
  });

  it("throws without a file buffer", async () => {
    await expect(
      parser.parse({ nodeId: "nb1", type: "md" }),
    ).rejects.toThrow("MD parser requires a file buffer");
  });
});

describe("HtmlParser", () => {
  const parser = new HtmlParser();

  it("extracts body text and strips script/noscript/footer", async () => {
    const buffer = readFileSync(resolve(fixtureDir, "sample.html"));
    const result = await parser.parse({
      nodeId: "nb1", type: "html", file: buffer, fileName: "sample.html",
    });
    expect(result.text).toContain("Welcome to the Sample");
    expect(result.text).toContain("Item One");
    expect(result.text).not.toContain("should be stripped by");
    expect(result.text).not.toContain("should also be stripped");
    expect(result.text).not.toContain("should be stripped too");
    expect(result.metadata.title).toBe("Sample Page");
    expect(result.metadata.parser).toBe("html");
  });

  it("throws without a file buffer", async () => {
    await expect(
      parser.parse({ nodeId: "nb1", type: "html" }),
    ).rejects.toThrow("HTML parser requires a file buffer");
  });

  it("falls back to raw text when body is empty", async () => {
    const result = await parser.parse({
      nodeId: "nb1", type: "html", file: Buffer.from("<html><head><title>T</title></head></html>"),
    });
    expect(result.text.length).toBeGreaterThan(0);
  });
});

describe("XlsxParser", () => {
  const parser = new XlsxParser();

  it("extracts cell values from all sheets", async () => {
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet([
      ["Name", "Age"],
      ["Alice", 32],
      ["Bob", 45],
    ]);
    XLSX.utils.book_append_sheet(wb, ws1, "Employees");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const result = await parser.parse({
      nodeId: "nb1", type: "xlsx", file: Buffer.from(buf), fileName: "test.xlsx",
    });
    expect(result.text).toContain("Employees");
    expect(result.text).toContain("Alice");
    expect(result.text).toContain("Bob");
    expect(result.metadata.sheetCount).toBe(1);
    expect(result.metadata.sheets).toContain("Employees");
    expect(result.metadata.parser).toBe("xlsx");
  });

  it("handles multiple sheets", async () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["A1"]]), "Sheet1");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["B1"]]), "Sheet2");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const result = await parser.parse({
      nodeId: "nb1", type: "xlsx", file: Buffer.from(buf), fileName: "multi.xlsx",
    });
    expect(result.text).toContain("Sheet1");
    expect(result.text).toContain("Sheet2");
    expect(result.metadata.sheetCount).toBe(2);
  });

  it("throws without a file buffer", async () => {
    await expect(
      parser.parse({ nodeId: "nb1", type: "xlsx" }),
    ).rejects.toThrow("XLSX parser requires a file buffer");
  });
});

describe("DocxParser", () => {
  const parser = new DocxParser();

  it("extracts text from a DOCX document", async () => {
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ children: [new TextRun("Hello from DOCX")] }),
          new Paragraph({ children: [new TextRun("This is a second paragraph.")] }),
        ],
      }],
    });
    const buf = await Packer.toBuffer(doc);

    const result = await parser.parse({
      nodeId: "nb1", type: "docx", file: Buffer.from(buf), fileName: "test.docx",
    });
    expect(result.text).toContain("Hello from DOCX");
    expect(result.text).toContain("second paragraph");
    expect(result.metadata.parser).toBe("docx");
  });

  it("throws without a file buffer", async () => {
    await expect(
      parser.parse({ nodeId: "nb1", type: "docx" }),
    ).rejects.toThrow("DOCX parser requires a file buffer");
  });
});
