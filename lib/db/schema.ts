import { pgTable, text, uuid, timestamp, jsonb, integer, vector, index } from "drizzle-orm/pg-core";

export const nodes = pgTable("nodes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sources = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  nodeId: uuid("node_id")
    .references(() => nodes.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type", { enum: ["pdf", "docx", "txt", "csv", "md", "html", "xlsx", "web", "youtube"] }).notNull(),
  name: text("name").notNull(),
  status: text("status", { enum: ["pending", "processing", "ready", "failed"] })
    .default("pending")
    .notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  rawText: text("raw_text"),
  progress: jsonb("progress"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  nodeId: uuid("node_id")
    .references(() => nodes.id, { onDelete: "cascade" })
    .notNull(),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  sources: text("sources").array().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chunks = pgTable(
  "chunks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceId: uuid("source_id")
      .references(() => sources.id, { onDelete: "cascade" })
      .notNull(),
    nodeId: uuid("node_id")
      .references(() => nodes.id, { onDelete: "cascade" })
      .notNull(),
    index: integer("index").notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 384 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    sourceIdx: index("idx_chunks_source").on(table.sourceId),
    nodeIdx: index("idx_chunks_node").on(table.nodeId),
  }),
);
