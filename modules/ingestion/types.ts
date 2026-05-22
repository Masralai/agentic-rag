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

export interface SourceParser {
  parse(input: SourceInput): Promise<ParsedContent>;
}

export type { Source, SourceType };
