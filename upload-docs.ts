//upload documents to Memory so agents can access and use them

import "dotenv/config";
import { Langbase } from "langbase";
import { readFile } from "fs/promises";
import path from "path";

const langbase = new Langbase({
  apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
  const cwd = process.cwd();
  const memoryName = "the-knowledge-base";

  // to upload agent arch doc
  const agentArch = await readFile(path.join(cwd, "docs", "agent-arch.txt"));
  const agentResult = await langbase.memories.documents.upload({
    memoryName,
    contentType: "text/plain",
    documentName: "agent-arch.txt",
    document: agentArch,
    meta: { category: "Examples", topic: "Agent Arch" },
  });

  console.log(agentResult.ok ? "agent doc uploaded" : "agent doc failed");

  // to upload langbase faq doc
  const langbaseFaq = await readFile(
    path.join(cwd, "docs", "langbase-faq.txt")
  );
  const faqResult = await langbase.memories.documents.upload({
    memoryName,
    contentType: "text/plain",
    documentName: "langbase-faq.txt",
    document: langbaseFaq,
    meta: { category: "Support", topic: "Langbase FAQs" },
  });

  console.log(faqResult.ok ? "faq doc uploaded" : "faq doc failed");
}

main();
