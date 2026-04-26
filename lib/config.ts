export const CONFIG = {
  MEMORY_NAME: "knowledge-base-v2",
  PIPE_NAME: "support-agent-gem-v2",
  EMBEDDING_MODEL: "google:text-embedding-004",
  LLM_MODEL: "google:gemini-2.0-flash",
} as const;

export type Config = typeof CONFIG;