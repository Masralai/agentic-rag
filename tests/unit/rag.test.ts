import { describe, it, expect } from "vitest";
import { buildChatPrompt, buildSummaryPrompt } from "@/modules/rag/prompts";

describe("RAG prompts", () => {
  describe("buildChatPrompt", () => {
    it("includes chunks and history in prompt", () => {
      const chunks = [
        {
          text: "Paris is the capital of France.",
          documentName: "geography.txt",
        },
      ];
      const history = [{ role: "user", content: "Tell me about Paris" }];

      const prompt = buildChatPrompt(chunks, history);

      expect(prompt).toContain("Paris is the capital of France");
      expect(prompt).toContain("[1]");
      expect(prompt).toContain("geography.txt");
      expect(prompt).toContain("Tell me about Paris");
    });

    it("handles empty history", () => {
      const chunks = [{ text: "Some content.", source: "doc.txt" }];
      const prompt = buildChatPrompt(chunks, []);

      expect(prompt).toContain("Some content.");
      expect(prompt).not.toContain("Conversation so far");
    });

    it("handles empty chunks gracefully", () => {
      const prompt = buildChatPrompt([], []);
      expect(prompt).toContain("No context provided");
    });
  });

  describe("buildSummaryPrompt", () => {
    it("builds study guide prompt", () => {
      const sources = [
        { name: "doc1.md", text: "Key concept X" },
        { name: "doc2.md", text: "Important fact Y" },
      ];

      const prompt = buildSummaryPrompt(sources, "study-guide");

      expect(prompt).toContain("study guide");
      expect(prompt).toContain("Key concept X");
      expect(prompt).toContain("doc1.md");
    });

    it("builds FAQ prompt", () => {
      const sources = [{ name: "faq.md", text: "Q: What is RAG?" }];

      const prompt = buildSummaryPrompt(sources, "faq");

      expect(prompt).toContain("FAQ");
      expect(prompt).toContain("Q: What is RAG?");
    });
  });
});
