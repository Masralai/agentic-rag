import { db } from "@/lib/db";
import { nodes, sources, chatMessages, chunks } from "@/lib/db/schema";
import { eq, and, like, inArray, sql } from "drizzle-orm";
import type { Node, Source, ChatMessage, SourceInput, Chunk } from "./types";

function toSource(row: any): Source {
  return { ...row, metadata: (row.metadata || {}) as Record<string, unknown> };
}

export class NodeRepo {
  async createNode(userId: string, name: string): Promise<Node> {
    const [n] = await db.insert(nodes).values({ userId, name }).returning();
    return n;
  }

  async listNodes(userId: string): Promise<Node[]> {
    return db.select().from(nodes).where(eq(nodes.userId, userId));
  }

  async renameNode(id: string, name: string): Promise<Node> {
    const [n] = await db
      .update(nodes)
      .set({ name, updatedAt: new Date() })
      .where(eq(nodes.id, id))
      .returning();
    return n;
  }

  async deleteNode(id: string): Promise<void> {
    await db.delete(nodes).where(eq(nodes.id, id));
  }

  async addSource(input: SourceInput & { status?: string; rawText?: string; metadata?: Record<string, unknown> }): Promise<Source> {
    const [s] = await db
      .insert(sources)
      .values({
        nodeId: input.nodeId,
        type: input.type,
        name: input.name || "unknown",
        status: (input.status as any) || "pending",
        rawText: input.rawText,
        metadata: input.metadata as any,
      })
      .returning();
    return toSource(s);
  }

  async removeSource(id: string): Promise<void> {
    await db.delete(sources).where(eq(sources.id, id));
  }

  async listSources(nodeId: string): Promise<Source[]> {
    const rows = await db
      .select()
      .from(sources)
      .where(eq(sources.nodeId, nodeId));
    return rows.map(toSource);
  }

  async getSourcesByIds(ids: string[]): Promise<Source[]> {
    if (ids.length === 0) return [];
    const rows = await db
      .select()
      .from(sources)
      .where(inArray(sources.id, ids));
    return rows.map(toSource);
  }

  async getSourceContent(id: string): Promise<string> {
    const [s] = await db
      .select({ rawText: sources.rawText })
      .from(sources)
      .where(eq(sources.id, id));
    return s?.rawText || "";
  }

  async updateSource(
    id: string,
    data: { status?: string; rawText?: string; metadata?: Record<string, unknown>; progress?: Record<string, unknown> | null },
  ): Promise<void> {
    await db
      .update(sources)
      .set({
        ...(data.status ? { status: data.status as any } : {}),
        ...(data.rawText !== undefined ? { rawText: data.rawText } : {}),
        ...(data.metadata ? { metadata: data.metadata as any } : {}),
        ...(data.progress !== undefined ? { progress: data.progress as any } : {}),
      })
      .where(eq(sources.id, id));
  }

  async searchSources(nodeId: string, query: string): Promise<Source[]> {
    const rows = await db
      .select()
      .from(sources)
      .where(
        and(
          eq(sources.nodeId, nodeId),
          like(sources.name, `%${query}%`),
        ),
      );
    return rows.map(toSource);
  }

  async addMessage(
    nodeId: string,
    role: "user" | "assistant",
    content: string,
    sourcesList: string[] = [],
  ): Promise<ChatMessage> {
    const [m] = await db
      .insert(chatMessages)
      .values({ nodeId, role, content, sources: sourcesList })
      .returning();
    return m;
  }

  async addChunks(
    sourceId: string,
    nodeId: string,
    entries: { index: number; content: string; embedding?: number[] }[],
  ): Promise<void> {
    if (entries.length === 0) return;

    for (const e of entries) {
      await db.insert(chunks).values({
        sourceId,
        nodeId,
        index: e.index,
        content: e.content,
        embedding: e.embedding ? sql`${`[${e.embedding.join(",")}]`}::vector` : null,
      });
    }
  }

  async deleteChunksBySource(sourceId: string): Promise<void> {
    await db.delete(chunks).where(eq(chunks.sourceId, sourceId));
  }

  async deleteChunksByNode(nodeId: string): Promise<void> {
    await db.delete(chunks).where(eq(chunks.nodeId, nodeId));
  }

  async searchChunks(
    nodeId: string,
    queryEmbedding: number[],
    topK: number = 4,
  ): Promise<Chunk[]> {
    const embeddingStr = `[${queryEmbedding.join(",")}]`;

    const rows = await db
      .select({
        id: chunks.id,
        sourceId: chunks.sourceId,
        nodeId: chunks.nodeId,
        index: chunks.index,
        content: chunks.content,
        embedding: chunks.embedding,
        createdAt: chunks.createdAt,
        sourceName: sources.name,
      })
      .from(chunks)
      .leftJoin(sources, eq(chunks.sourceId, sources.id))
      .where(eq(chunks.nodeId, nodeId))
      .orderBy(sql`${chunks.embedding} <=> ${embeddingStr}::vector`)
      .limit(topK);

    return rows.map((r: any) => ({
      ...r,
      embedding: r.embedding ? JSON.parse(JSON.stringify(r.embedding)) : undefined,
    }));
  }

  async listMessages(nodeId: string): Promise<ChatMessage[]> {
    return db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.nodeId, nodeId))
      .orderBy(chatMessages.createdAt);
  }
}
