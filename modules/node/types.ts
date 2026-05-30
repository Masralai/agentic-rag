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
}

export interface ChatMessage {
  id: string;
  nodeId: string;
  role: "user" | "assistant";
  content: string;
  sources: string[];
  createdAt: Date;
}
