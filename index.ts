//agent creation, memory setup, and document upload.

import { runMemoryAgent } from "./agents";

async function main() {
  const chunks = await runMemoryAgent("What is agent parallelization?");
  console.log("Memory chunk:", chunks);
}

main();
