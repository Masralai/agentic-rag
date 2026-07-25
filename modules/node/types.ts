export type SourceType = "pdf" | "docx" | "txt" | "web" | "youtube" | "csv" | "md" | "html" | "xlsx";

export type SourceStatus = "pending" | "processing" | "ready" | "failed";

export interface Node {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessingProgress {
  current: number;
  total: number;
  phase: string;
}

export interface Source {
  id: string;
  nodeId: string;
  type: SourceType;
  name: string;
  status: SourceStatus;
  enabled: boolean;
  metadata: Record<string, unknown>;
  rawText?: string;
  progress?: ProcessingProgress | null;
  createdAt: Date;
}

export interface SourceInput {
  nodeId: string;
  type: SourceType;
  name?: string;
  url?: string;
  status?: string;
  rawText?: string;
  metadata?: Record<string, unknown>;
}

export interface Chunk {
  id: string;
  sourceId: string;
  nodeId: string;
  index: number;
  content: string;
  embedding?: number[];
  sourceName?: string;
  createdAt: Date;
}

export interface Citation {
  index: number;
  sourceId: string;
  sourceName: string;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  nodeId: string;
  role: "user" | "assistant";
  content: string;
  sources: string[];
  citations: Citation[];
  createdAt: Date;
}

export interface Artifact {
  id: string;
  nodeId: string;
  type: "study-guide" | "faq";
  content: string;
  createdAt: Date;
}
