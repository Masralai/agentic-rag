//agent creation, memory setup, and document upload.

import { runMemoryAgent, runAISupportAgent } from "./agents";

async function main() {
  const query = 'What is agent parallelization?'
  const chunks = await runMemoryAgent(query);

  const completion = await runAISupportAgent({
    chunks,
    query,
  })

  console.log('completion: ', completion)

}

main();
