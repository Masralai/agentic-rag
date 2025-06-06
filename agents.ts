// AI agent creation and configuration.

import "dotenv/config";
import { Langbase } from "langbase";

const langbase = new Langbase({
  apiKey: process.env.LANGBASE_API_KEY!,
});

export async function runMemoryAgent(query: string) {
  const chunks = await langbase.memories.retrieve({
    query:"What is agent parallelization?",
    topK: 4,
    memory: [
      {
        name: "the-knowledge-base",
      },
    ],
  });
  console.log(chunks);
  return chunks;
}