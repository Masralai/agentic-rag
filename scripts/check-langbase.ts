import { Langbase } from "langbase";
import { CONFIG } from "../lib/config";

const apiKey = process.env.LANGBASE_API_KEY;
if (!apiKey) {
  console.error("LANGBASE_API_KEY is not set");
  process.exit(1);
}

const langbase = new Langbase({ apiKey });

async function main() {
  console.log("=== Langbase Health Check ===\n");
  console.log(`Configured pipe:   "${CONFIG.PIPE_NAME}"`);
  console.log(`Configured memory: "${CONFIG.MEMORY_NAME}"\n`);

  // List pipes
  console.log("--- Pipes ---");
  try {
    const pipes: any[] = await langbase.pipes.list();
    if (pipes.length === 0) {
      console.log("No pipes found in this account.");
    } else {
      for (const p of pipes) {
        const match = p.name === CONFIG.PIPE_NAME ? " <<< CONFIGURED" : "";
        console.log(`  ${p.name} (model: ${p.model})${match}`);
      }
    }
  } catch (e: any) {
    console.error(`  Failed to list pipes: ${e.message}`);
  }

  // List memories
  console.log("\n--- Memories ---");
  try {
    const memories: any[] = await langbase.memories.list();
    if (memories.length === 0) {
      console.log("No memories found in this account.");
    } else {
      for (const m of memories) {
        const match = m.name === CONFIG.MEMORY_NAME ? " <<< CONFIGURED" : "";
        console.log(`  ${m.name} (embedding: ${m.embeddingModel})${match}`);
      }
    }
  } catch (e: any) {
    console.error(`  Failed to list memories: ${e.message}`);
  }

  // Test a simple pipe run
  console.log("\n--- Pipe Run Test ---");
  if (process.env.TEST_PIPE) {
    try {
      const { completion } = await langbase.pipes.run({
        name: process.env.TEST_PIPE,
        stream: false,
        messages: [{ role: "user", content: "Say hello in one word." }],
      });
      console.log(`  Response: "${completion}"`);
    } catch (e: any) {
      console.error(`  Failed: ${e.message}`);
    }
  } else {
    console.log("  Set TEST_PIPE=<name> to test a pipe run.");
  }

  // Test memory document upload
  console.log("\n--- Memory Upload Test ---");
  if (process.env.TEST_MEMORY) {
    try {
      const result = await langbase.memories.documents.upload({
        memoryName: process.env.TEST_MEMORY,
        contentType: "text/plain",
        documentName: `health-check-${Date.now()}.txt`,
        document: Buffer.from("Hello, this is a health check document."),
      });
      console.log(`  Upload: ${result.ok ? "OK" : "FAILED"} (status: ${result.status})`);
    } catch (e: any) {
      console.error(`  Failed: ${e.message}`);
    }
  } else {
    console.log("  Set TEST_MEMORY=<name> to test memory upload.");
  }

  console.log("\n=== Done ===");
}

main().catch(console.error);
