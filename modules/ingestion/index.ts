import type { SourceInput, ParsedContent, SourceParser } from "./types";
import type { Source } from "@/modules/node/types";
import { PdfParser } from "./parsers/pdf";
import { DocxParser } from "./parsers/docx";
import { TxtParser } from "./parsers/txt";
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
  web: new WebParser(),
  youtube: new YouTubeParser(),
};

function chunkText(text: string, maxSize = 4000): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  let current = "";

  for (const p of paragraphs) {
    if ((current + "\n\n" + p).length > maxSize && current.length > 0) {
      chunks.push(current.trim());
      current = p;
    } else {
      current = current ? current + "\n\n" + p : p;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks;
}

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
    const chunks = chunkText(parsed.text);

    for (const chunk of chunks) {
      await langbase.memories.documents.upload({
        memoryName: CONFIG.MEMORY_NAME,
        contentType: "text/plain",
        documentName: `${input.name ? input.name.replace(/\.[^/.]+$/, "") : "source"}-${Date.now()}.txt`,
        document: Buffer.from(chunk),
      });
    }

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
