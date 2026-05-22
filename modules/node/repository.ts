import { db } from "@/lib/db";
import { nodes, sources, chatMessages } from "@/lib/db/schema";
import { eq, and, like } from "drizzle-orm";
import type { Node, Source, ChatMessage, SourceInput } from "./types";

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

  async getSourceContent(id: string): Promise<string> {
    const [s] = await db
      .select({ rawText: sources.rawText })
      .from(sources)
      .where(eq(sources.id, id));
    return s?.rawText || "";
  }

  async updateSource(
    id: string,
    data: { status?: string; rawText?: string; metadata?: Record<string, unknown> },
  ): Promise<void> {
    await db
      .update(sources)
      .set({
        ...(data.status ? { status: data.status as any } : {}),
        ...(data.rawText !== undefined ? { rawText: data.rawText } : {}),
        ...(data.metadata ? { metadata: data.metadata as any } : {}),
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

  async listMessages(nodeId: string): Promise<ChatMessage[]> {
    return db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.nodeId, nodeId))
      .orderBy(chatMessages.createdAt);
  }
}
