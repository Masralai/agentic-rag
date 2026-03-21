// upload documents to Memory so agents can access and use them
import "dotenv/config";
import { Langbase } from "langbase";
import { readFile } from "fs/promises";
import path from "path";
import { CONFIG } from "./config";

const langbase = new Langbase({
  apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
  const cwd = process.cwd();
  const memoryName = CONFIG.MEMORY_NAME;

  try {
    // upload agent arch doc
    const agentArch = await readFile(path.join(cwd, "docs", "agent-arch.txt"));
    const agentResult = await langbase.memories.documents.upload({
      memoryName,
      contentType: "text/plain",
      documentName: "agent-arch.txt",
      document: agentArch,
      meta: { category: "Examples", topic: "Agent Arch" },
    });
    console.log(agentResult.ok ? "Agent doc uploaded" : "Agent doc upload failed");

    // upload langbase faq doc
    const langbaseFaq = await readFile(path.join(cwd, "docs", "langbase-faq.txt"));
    const faqResult = await langbase.memories.documents.upload({
      memoryName,
      contentType: "text/plain",
      documentName: "langbase-faq.txt",
      document: langbaseFaq,
      meta: { category: "Support", topic: "Langbase FAQs" },
    });
    console.log(faqResult.ok ? "FAQ doc uploaded" : "FAQ doc upload failed");
  } catch (error) {
    console.error("Error uploading documents:", error);
  }
}

main();
