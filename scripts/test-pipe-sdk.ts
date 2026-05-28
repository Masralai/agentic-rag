import { Langbase } from "langbase";

const apiKey = process.env.LANGBASE_API_KEY!;
const langbase = new Langbase({ apiKey });

async function main() {
  console.log("=== SDK pipe.run() test with support-agent-gem ===\n");

  try {
    const result = await langbase.pipes.run({
      name: "support-agent-gem",
      stream: false,
      messages: [{ role: "user", content: "Say hello in one word." }],
    });
    console.log("Success:", JSON.stringify(result).slice(0, 500));
  } catch (e: any) {
    console.error("Error:", e.message);
    console.error("Full error:", JSON.stringify(e, null, 2));
  }

  console.log("\n=== SDK pipe.run() test with support-agent-gem-v2 ===\n");

  try {
    const result = await langbase.pipes.run({
      name: "support-agent-gem-v2",
      stream: false,
      messages: [{ role: "user", content: "Say hello in one word." }],
    });
    console.log("Success:", JSON.stringify(result).slice(0, 500));
  } catch (e: any) {
    console.error("Error:", e.message);
    console.error("Full error:", JSON.stringify(e, null, 2));
  }
}

main().catch(console.error);
