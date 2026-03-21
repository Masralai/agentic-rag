import "dotenv/config";
import { Langbase } from "langbase";
import { CONFIG } from "./config";

const langbase = new Langbase({
  apiKey: process.env.LANGBASE_API_KEY!,
});

async function queryAgentArchitecture() {
  const knowledgePipeName = CONFIG.PIPE_NAME;

  console.log(`\nQuerying Agent about Architectures...`);

  const questions = [
    "Can you describe the different agent architectures?",
    "What is an Augmented LLM (Pipe Agent) in Langbase?",
    "Explain Prompt chaining and composition."
  ];

  for (const question of questions) {
    console.log(`\nQuestion: "${question}"`);
    try {
      const { completion } = await langbase.pipes.run({
        name: knowledgePipeName,
        messages: [{ role: "user", content: question }],
        stream: false,
      });
      console.log("Agent's Answer:");
      console.log(completion);
    } catch (error) {
      console.error(`Error querying agent for: "${question}"`, error);
    }
  }
}

queryAgentArchitecture();
