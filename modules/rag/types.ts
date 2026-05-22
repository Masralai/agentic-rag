export interface StreamChunk {
  type: "token" | "done" | "error";
  content?: string;
  sources?: string[];
  error?: string;
}

export interface Summary {
  id: string;
  nodeId: string;
  type: "study-guide" | "faq";
  content: string;
  createdAt: Date;
}

export type SummaryType = "study-guide" | "faq";
