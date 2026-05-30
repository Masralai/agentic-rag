import type { SourceType, Source } from "@/modules/node/types";

export interface SourceInput {
  nodeId: string;
  type: SourceType;
  file?: Buffer;
  fileName?: string;
  url?: string;
  name?: string;
  mimeType?: string;
}

export interface ParsedContent {
  text: string;
  metadata: Record<string, unknown>;
}

export interface ParseOptions {
  onProgress?: (current: number, total: number, phase: string) => void;
}

export interface SourceParser {
  parse(input: SourceInput, options?: ParseOptions): Promise<ParsedContent>;
}

export type { Source, SourceType };
