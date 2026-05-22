import { NotebookRepo } from "./repository";
import type { Notebook, Source, ChatMessage, SourceInput } from "./types";

export type { Notebook, Source, ChatMessage, SourceInput } from "./types";

const repo = new NotebookRepo();

export const notebookService = {
  createNotebook: (userId: string, name: string) => repo.createNotebook(userId, name),
  listNotebooks: (userId: string) => repo.listNotebooks(userId),
  renameNotebook: (id: string, name: string) => repo.renameNotebook(id, name),
  deleteNotebook: (id: string) => repo.deleteNotebook(id),

  addSource: (input: SourceInput & { status?: string; rawText?: string; metadata?: Record<string, unknown> }) =>
    repo.addSource(input),
  updateSource: (id: string, data: { status?: string; rawText?: string; metadata?: Record<string, unknown> }) =>
    repo.updateSource(id, data),
  removeSource: (id: string) => repo.removeSource(id),
  listSources: (notebookId: string) => repo.listSources(notebookId),
  getSourceContent: (id: string) => repo.getSourceContent(id),
  searchSources: (notebookId: string, query: string) => repo.searchSources(notebookId, query),

  addMessage: (notebookId: string, role: "user" | "assistant", content: string, sources?: string[]) =>
    repo.addMessage(notebookId, role, content, sources),
  listMessages: (notebookId: string) => repo.listMessages(notebookId),
};
