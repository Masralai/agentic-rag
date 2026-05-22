import { db } from "@/lib/db";
import { notebooks, sources, chatMessages } from "@/lib/db/schema";
import { eq, and, like } from "drizzle-orm";
import type { Notebook, Source, ChatMessage, SourceInput } from "./types";

function toSource(row: any): Source {
  return { ...row, metadata: (row.metadata || {}) as Record<string, unknown> };
}

export class NotebookRepo {
  async createNotebook(userId: string, name: string): Promise<Notebook> {
    const [n] = await db.insert(notebooks).values({ userId, name }).returning();
    return n;
  }

  async listNotebooks(userId: string): Promise<Notebook[]> {
    return db.select().from(notebooks).where(eq(notebooks.userId, userId));
  }

  async renameNotebook(id: string, name: string): Promise<Notebook> {
    const [n] = await db
      .update(notebooks)
      .set({ name, updatedAt: new Date() })
      .where(eq(notebooks.id, id))
      .returning();
    return n;
  }

  async deleteNotebook(id: string): Promise<void> {
    await db.delete(notebooks).where(eq(notebooks.id, id));
  }

  async addSource(input: SourceInput & { status?: string; rawText?: string; metadata?: Record<string, unknown> }): Promise<Source> {
    const [s] = await db
      .insert(sources)
      .values({
        notebookId: input.notebookId,
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

  async listSources(notebookId: string): Promise<Source[]> {
    const rows = await db
      .select()
      .from(sources)
      .where(eq(sources.notebookId, notebookId));
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

  async searchSources(notebookId: string, query: string): Promise<Source[]> {
    const rows = await db
      .select()
      .from(sources)
      .where(
        and(
          eq(sources.notebookId, notebookId),
          like(sources.name, `%${query}%`),
        ),
      );
    return rows.map(toSource);
  }

  async addMessage(
    notebookId: string,
    role: "user" | "assistant",
    content: string,
    sourcesList: string[] = [],
  ): Promise<ChatMessage> {
    const [m] = await db
      .insert(chatMessages)
      .values({ notebookId, role, content, sources: sourcesList })
      .returning();
    return m;
  }

  async listMessages(notebookId: string): Promise<ChatMessage[]> {
    return db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.notebookId, notebookId))
      .orderBy(chatMessages.createdAt);
  }
}
