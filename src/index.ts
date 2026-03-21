// Main entry point for the agentic-rag project.
import { runMemoryAgent, runAISupportAgent } from "./agents";

async function main() {
  try {
    // Get query from command line arguments or use a default one
    const query = process.argv[2] || 'What is agent parallelization?';
    
    console.log(`\n--- Starting Agentic RAG Pipeline ---`);
    console.log(`Query: "${query}"\n`);

    // Step 1: Retrieve relevant information from memory
    const chunks = await runMemoryAgent(query);
    
    if (!chunks || chunks.length === 0) {
      console.log("No relevant information found in memory.");
      return;
    }

    console.log(`Found ${chunks.length} relevant chunks.\n`);

    // Step 2: Generate a completion based on retrieved chunks
    const completion = await runAISupportAgent({
      chunks,
      query,
    });

    console.log('--- AI Agent Completion ---\n');
    console.log(completion);
    console.log('\n--- End of Pipeline ---\n');

  } catch (error) {
    console.error("Critical error in main pipeline:", error);
    process.exit(1);
  }
}

main();
