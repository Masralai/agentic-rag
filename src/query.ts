
import "dotenv/config";
import { Langbase } from "langbase";



const langbase = new Langbase({
  apiKey: process.env.LANGBASE_API_KEY!,
});
async function queryAgentArchitecture() {
 
  const knowledgePipeName = `support-agent-gem`; 

  console.log(`\nQuerying Agent about Architectures...`);


  const question1 = "Can you describe the different agent architectures?";
  console.log(`\nQuestion 1: "${question1}"`);
  try {
    const { completion } = await langbase.pipes.run({
      name: knowledgePipeName,
      messages: [{ role: "user", content: question1 }],
      stream: false,
    });
    console.log("Agent's Answer 1:");
    console.log(completion);
    
  } catch (error) {
    console.error("Error querying agent for architectures:", error);
  }

  const question2 = "What is an Augmented LLM (Pipe Agent) in Langbase?";
  console.log(`\nQuestion 2: "${question2}"`);
  try {
    const { completion } = await langbase.pipes.run({
      name: knowledgePipeName,
      messages: [{ role: "user", content: question2 }],
      stream: false,
    });
    console.log("Agent's Answer 2:");
    console.log(completion);
    
  } catch (error) {
    console.error("Error querying agent for Augmented LLM:", error);
  }

  // --- Test Query 3: Another specific architecture ---
  const question3 = "Explain Prompt chaining and composition.";
  console.log(`\nQuestion 3: "${question3}"`);
  try {
    const { completion } = await langbase.pipes.run({
      name: knowledgePipeName,
      messages: [{ role: "user", content: question3 }],
      stream: false,
    });
    console.log("Agent's Answer 3:");
    console.log(completion);
    // Look for a response that matches:
    // "Prompt chaining splits a task into steps, with each LLM call using the previous step's result."
  } catch (error) {
    console.error("Error querying agent for Prompt chaining:", error);
  }
}

queryAgentArchitecture();