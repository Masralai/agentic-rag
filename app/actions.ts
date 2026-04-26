"use server";

import { revalidatePath } from "next/cache";
import { langbase } from "@/lib/langbase";
import { CONFIG } from "@/lib/config";
import { runMemoryAgent, runAISupportAgent } from "@/lib/agents";
import type { QueryResult, UploadResult } from "@/lib/types";

export async function askAgent(query: string): Promise<QueryResult> {
  try {
    const chunks = await runMemoryAgent(query);

    if (!chunks || chunks.length === 0) {
      return {
        completion: "No relevant information found in memory. Please upload some documents first.",
        sources: [],
      };
    }

    const completion = await runAISupportAgent({
      chunks,
      query,
    });

    const sources = (chunks as any[]).map((c) => c.documentName || c.source || "Unknown");

    return { completion, sources };
  } catch (error) {
    console.error("Agent Error:", error);
    return { error: "Failed to process query." };
  }
}

export async function uploadFile(formData: FormData): Promise<UploadResult> {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log(`Uploading ${file.name} to Langbase Memory...`);

    const result = await langbase.memories.documents.upload({
      memoryName: CONFIG.MEMORY_NAME,
      contentType: (file.type as any) || "text/plain",
      documentName: file.name,
      document: buffer,
    });

    if (!result.ok) {
      throw new Error("Langbase upload failed");
    }

    revalidatePath("/");
    return { success: true, fileName: file.name };
  } catch (error) {
    console.error("Upload Error:", error);
    return { error: "Failed to upload document." };
  }
}

export async function listDocuments() {
  try {
    const documents = await langbase.memories.documents.list({
      memoryName: CONFIG.MEMORY_NAME,
    });
    return documents || [];
  } catch (error) {
    console.error("List Docs Error:", error);
    return [];
  }
}