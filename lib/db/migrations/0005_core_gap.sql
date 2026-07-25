ALTER TABLE "sources" ADD COLUMN IF NOT EXISTS "enabled" boolean DEFAULT true NOT NULL;
ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "citations" jsonb DEFAULT '[]'::jsonb NOT NULL;
CREATE TABLE IF NOT EXISTS "artifacts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "node_id" uuid NOT NULL REFERENCES "nodes"("id") ON DELETE cascade,
  "type" text NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_artifacts_node" ON "artifacts" ("node_id");
