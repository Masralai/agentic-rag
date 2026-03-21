// AI agent creation and configuration.

import "dotenv/config";
import { Langbase, MemoryRetrieveResponse } from "langbase";
import { CONFIG } from "./config";

const langbase = new Langbase({
  apiKey: process.env.LANGBASE_API_KEY!,
});

/**
 * Runs the AI Support Agent using the retrieved memory chunks.
 * Note: If using native memory integration, this function could be simplified further.
 */
export async function runAISupportAgent({
  chunks,
  query,
}: {
  chunks: MemoryRetrieveResponse[];
  query: string;
}) {
  try {
    const systemPrompt = await getSystemPrompt(chunks);
    const { completion } = await langbase.pipes.run({
      stream: false,
      name: CONFIG.PIPE_NAME,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: query,
        },
      ],
    });
    return completion;
  } catch (error) {
    console.error("Error in runAISupportAgent:", error);
    throw new Error("Failed to get completion from AI Support Agent.");
  }
}

async function getSystemPrompt(chunks: MemoryRetrieveResponse[]) {
  const chunksText = chunks.map(chunk => `${chunk.text}\nSource: ${chunk.documentName}`).join("\n---\n");
  
  return `
    You're a helpful AI assistant.
    You will assist users with their queries.

    Always ensure that you provide accurate and to the point information.
    Below is some CONTEXT for you to answer the questions. ONLY answer from the CONTEXT. 
    CONTEXT consists of multiple information chunks. Each chunk has a source mentioned at the end.

    For each piece of response you provide, cite the source in brackets like so: [1].

    At the end of the answer, always list each source with its corresponding number and provide the document name. 
    Example: [1] Filename.doc. If there is a URL, make it a hyperlink on the name.

    If you don't know the answer, say so. Ask for more context if needed.

    CONTEXT:
    ${chunksText}`;
}

/**
 * Retrieves relevant chunks from the knowledge base memory.
 */
export async function runMemoryAgent(query: string) {
  try {
    console.log(`Searching memory for: "${query}"`);
    const chunks = await langbase.memories.retrieve({
      query: query, // Dynamic query
      topK: 4,
      memory: [
        {
          name: CONFIG.MEMORY_NAME,
        },
      ],
    });
    return chunks;
  } catch (error) {
    console.error("Error in runMemoryAgent:", error);
    throw new Error("Failed to retrieve data from memory.");
  }
}
