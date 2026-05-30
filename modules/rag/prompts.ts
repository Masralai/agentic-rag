export function buildChatPrompt(chunks: { text: string; documentName?: string; source?: string }[], history: { role: string; content: string }[]): string {
  const chunksText = chunks
    .map(
      (chunk, i) =>
        `[${i + 1}] ${chunk.text}\nSource: ${chunk.documentName || chunk.source || "Unknown"}`,
    )
    .join("\n---\n");

  const historyText = history
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  return `
You are a helpful AI assistant. Answer questions based ONLY on the provided context below.
Use the conversation history for context on follow-up questions.
Cite sources in brackets like [1]. At the end, list each source with its number and document name.
If the context doesn't contain the answer, say you don't know. Do not use prior knowledge.

${history.length > 0 ? `Conversation so far:\n${historyText}\n` : ""}

Context:
${chunksText || "No context provided."}`;
}

export function buildSummaryPrompt(sources: { name: string; text: string }[], type: "study-guide" | "faq"): string {
  if (sources.length === 0) {
    return `No source material available to generate a ${type === "study-guide" ? "study guide" : "FAQ"}.`;
  }

  const sourcesText = sources
    .map((s, i) => `[${i + 1}] ${s.name}\n${s.text}`)
    .join("\n\n");

  const instructions =
    type === "study-guide"
      ? "Generate a structured study guide covering key concepts, important points, and takeaways from the sources."
      : "Generate a list of frequently asked questions (FAQs) with answers based on the sources.";

  return `
${instructions}
Base everything on the provided source material.
Cite sources in brackets like [1] where applicable.
Be comprehensive but concise. Provide specific details and examples from the sources.

Sources:
${sourcesText}`;
}
