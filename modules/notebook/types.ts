export type SourceType = "pdf" | "docx" | "txt" | "web" | "youtube";

export type SourceStatus = "pending" | "processing" | "ready" | "failed";

export interface Notebook {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Source {
  id: string;
  notebookId: string;
  type: SourceType;
  name: string;
  status: SourceStatus;
  metadata: Record<string, unknown>;
  rawText?: string;
  createdAt: Date;
}

export interface SourceInput {
  notebookId: string;
  type: SourceType;
  name?: string;
  url?: string;
}

export interface ChatMessage {
  id: string;
  notebookId: string;
  role: "user" | "assistant";
  content: string;
  sources: string[];
  createdAt: Date;
}
