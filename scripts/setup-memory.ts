import "dotenv/config";
import { langbase } from "../lib/langbase";
import { CONFIG } from "../lib/config";

async function main() {
  try {
    const memory = await langbase.memories.create({
      name: CONFIG.MEMORY_NAME,
      description: "An AI memory for agentic memory workshop",
      embedding_model: CONFIG.EMBEDDING_MODEL as any,
    });
    console.log("Memory created successfully:", memory.name);
  } catch (error) {
    console.error("Error creating memory:", error);
  }
}

main();