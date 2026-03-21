// Langbase Memory (RAG) for storing and retrieving context.
import "dotenv/config";
import { Langbase } from "langbase";
import { CONFIG } from "./config";

const langbase = new Langbase({
  apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
  try {
    const memory = await langbase.memories.create({
      name: CONFIG.MEMORY_NAME,
      description: "An AI memory for agentic memory workshop",
      embedding_model: CONFIG.EMBEDDING_MODEL,
    });
    console.log("Memory created successfully:", memory.name);
  } catch (error) {
    console.error("Error creating memory:", error);
  }
}

main();
