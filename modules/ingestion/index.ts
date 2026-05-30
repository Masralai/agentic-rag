import type { SourceInput, ParsedContent, SourceParser } from "./types";
import type { Source } from "@/modules/node/types";
import { PdfParser } from "./parsers/pdf";
import { DocxParser } from "./parsers/docx";
import { TxtParser } from "./parsers/txt";
import { CsvParser } from "./parsers/csv";
import { MdParser } from "./parsers/md";
import { HtmlParser } from "./parsers/html";
import { XlsxParser } from "./parsers/xlsx";
import { WebParser } from "./parsers/web";
import { YouTubeParser } from "./parsers/youtube";
import { nodeService } from "@/modules/node";
import { langbase } from "@/lib/langbase";
import { CONFIG } from "@/lib/config";

export type { SourceInput } from "./types";

const parsers: Record<string, SourceParser> = {
  pdf: new PdfParser(),
  docx: new DocxParser(),
  txt: new TxtParser(),
  csv: new CsvParser(),
  md: new MdParser(),
  html: new HtmlParser(),
  xlsx: new XlsxParser(),
  web: new WebParser(),
  youtube: new YouTubeParser(),
};

export async function ingest(input: SourceInput): Promise<Source> {
  const parser = parsers[input.type];
  if (!parser) throw new Error(`No parser for source type: ${input.type}`);

  const sourceRecord = await nodeService.addSource({
    nodeId: input.nodeId,
    type: input.type,
    name: input.name,
    url: input.url,
    status: "pending",
  } as Parameters<typeof nodeService.addSource>[0]);

  try {
    await nodeService.updateSource(sourceRecord.id, { status: "processing" });

    const parsed: ParsedContent = await parser.parse(input);

    await langbase.memories.documents.upload({
      memoryName: CONFIG.MEMORY_NAME,
      contentType: "text/plain",
      documentName: `${input.name ? input.name.replace(/\.[^/.]+$/, "") : "source"}-${Date.now()}.txt`,
      document: Buffer.from(parsed.text),
    });

    await nodeService.updateSource(sourceRecord.id, {
      status: "ready",
      rawText: parsed.text,
      metadata: parsed.metadata as Record<string, unknown>,
    });

    return { ...sourceRecord, status: "ready", metadata: parsed.metadata as Record<string, unknown>, rawText: parsed.text };
  } catch (error) {
    await nodeService.updateSource(sourceRecord.id, { status: "failed" });
    throw error;
  }
}
