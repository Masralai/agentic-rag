import { NodeRepo } from "./repository";
import type { Node, Source, ChatMessage, SourceInput } from "./types";

export type { Node, Source, ChatMessage, SourceInput } from "./types";

const repo = new NodeRepo();

export const nodeService = {
  createNode: (userId: string, name: string) => repo.createNode(userId, name),
  listNodes: (userId: string) => repo.listNodes(userId),
  renameNode: (id: string, name: string) => repo.renameNode(id, name),
  deleteNode: (id: string) => repo.deleteNode(id),

  addSource: (input: SourceInput) => repo.addSource(input),
  removeSource: (id: string) => repo.removeSource(id),
  listSources: (nodeId: string) => repo.listSources(nodeId),
  getSourceContent: (id: string) => repo.getSourceContent(id),
  updateSource: (id: string, data: { status?: string; rawText?: string; metadata?: Record<string, unknown> }) =>
    repo.updateSource(id, data),
  searchSources: (nodeId: string, query: string) => repo.searchSources(nodeId, query),

  addMessage: (nodeId: string, role: "user" | "assistant", content: string, sources?: string[]) =>
    repo.addMessage(nodeId, role, content, sources),
  listMessages: (nodeId: string) => repo.listMessages(nodeId),
};
