import { pgTable, text, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";

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
