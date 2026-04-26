import "dotenv/config";
import { langbase } from "../lib/langbase";
import { CONFIG } from "../lib/config";

async function checkStatus() {
  console.log("Checking Langbase Status...");
  console.log("Memory Name:", CONFIG.MEMORY_NAME);
  console.log("Pipe Name:", CONFIG.PIPE_NAME);

  try {
    console.log("\n--- Checking Memory ---");
    try {
      const memories = (await langbase.memories.list()) as any[];
      const memoryExists = memories.find((m) => m.name === CONFIG.MEMORY_NAME);
      if (memoryExists) {
        console.log("✅ Memory exists");

        const docs = (await langbase.memories.documents.list({
          memoryName: CONFIG.MEMORY_NAME,
        })) as any[];
        console.log(`Docs in memory: ${docs.length || 0}`);
        docs.forEach((d) => console.log(` - ${d.name} (${d.status})`));
      } else {
        console.log("❌ Memory does NOT exist. Run 'npm run setup:memory'");
      }
    } catch (e: any) {
      console.error("Error listing memories:", e.message);
    }

    console.log("\n--- Checking Pipe ---");
    try {
      const pipes = (await langbase.pipes.list()) as any[];
      const pipeExists = pipes.find((p) => p.name === CONFIG.PIPE_NAME);
      if (pipeExists) {
        console.log("✅ Pipe exists");
      } else {
        console.log("❌ Pipe does NOT exist. Run 'npm run setup:pipe'");
      }
    } catch (e: any) {
      console.error("Error listing pipes:", e.message);
    }
  } catch (error) {
    console.error("Check failed:", error);
  }
}

checkStatus();