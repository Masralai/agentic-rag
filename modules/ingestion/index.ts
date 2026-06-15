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
import { embedBatch } from "@/modules/llm/embed";
import { chunkText } from "./chunk";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

export type { SourceInput } from "./types";
export { PdfParser } from "./parsers/pdf";

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

const TEMP_DIR = "/tmp/psynapse";

function loadTempFile(sourceId: string, fileName: string): Buffer | null {
  const filePath = join(TEMP_DIR, sourceId, fileName);
  if (!existsSync(filePath)) return null;
  return require("fs").readFileSync(filePath);
}

function findFirstTempFile(sourceId: string): { name: string; buffer: Buffer } | null {
  const dir = join(TEMP_DIR, sourceId);
  if (!existsSync(dir)) return null;
  const files = require("fs").readdirSync(dir);
  if (files.length === 0) return null;
  const name = files[0];
  return { name, buffer: require("fs").readFileSync(join(dir, name)) };
}

function cleanTempDir(sourceId: string) {
  const dir = join(TEMP_DIR, sourceId);
  if (!existsSync(dir)) return;
  const files = require("fs").readdirSync(dir);
  for (const f of files) require("fs").unlinkSync(join(dir, f));
  require("fs").rmdirSync(dir);
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

    const textChunks = chunkText(parsed.text);
    const embeddings = await embedBatch(textChunks);
    await nodeService.addChunks(
      sourceRecord.id,
      sourceRecord.nodeId,
      textChunks.map((content, i) => ({
        index: i,
        content,
        embedding: embeddings[i],
      })),
    );

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

export async function processSource(sourceId: string): Promise<void> {
  const sources = await nodeService.getSourcesByIds([sourceId]);
  const source = sources[0];
  if (!source) throw new Error(`Source not found: ${sourceId}`);

  const parser = parsers[source.type];
  if (!parser) {
    await nodeService.updateSource(sourceId, { status: "failed" });
    throw new Error(`No parser for source type: ${source.type}`);
  }

  const input: SourceInput = {
    nodeId: source.nodeId,
    type: source.type as any,
    name: source.name,
    fileName: source.name,
  };

  const tempFile = findFirstTempFile(sourceId);
  if (tempFile) {
    input.file = tempFile.buffer;
    input.fileName = tempFile.name;
  }

  await nodeService.updateSource(sourceId, { status: "processing" });

  try {
    const parsed = await parser.parse(input, {
      onProgress: (current, total, phase) => {
        nodeService.updateSource(sourceId, {
          progress: { current, total, phase } as any,
        });
      },
    });

    await nodeService.updateSource(sourceId, {
      progress: { current: 1, total: 1, phase: "Indexing chunks..." } as any,
    });

    const textChunks = chunkText(parsed.text);
    const embeddings = textChunks.length > 0 ? await embedBatch(textChunks).catch(() => []) : [];
    await nodeService.addChunks(
      sourceId,
      source.nodeId,
      textChunks.map((content, i) => ({
        index: i,
        content,
        embedding: embeddings[i] || undefined,
      })),
    );

    await nodeService.updateSource(sourceId, {
      status: "ready",
      rawText: parsed.text,
      metadata: parsed.metadata as Record<string, unknown>,
      progress: null,
    });

    cleanTempDir(sourceId);
  } catch (error) {
    await nodeService.updateSource(sourceId, { status: "failed" });
    throw error;
  }
}
