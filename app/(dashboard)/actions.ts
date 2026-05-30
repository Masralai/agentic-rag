"use server";

import { requireAuth } from "@/modules/auth";
import { nodeService } from "@/modules/node";
import { ingest } from "@/modules/ingestion";
import { summarize, type SummaryType } from "@/modules/rag";
import { revalidatePath } from "next/cache";

export async function createNode(name: string) {
  const { userId } = await requireAuth();
  const node = await nodeService.createNode(userId, name);
  revalidatePath("/");
  return node;
}

export async function listNodes() {
  const { userId } = await requireAuth();
  return nodeService.listNodes(userId);
}

export async function renameNode(id: string, name: string) {
  await requireAuth();
  const node = await nodeService.renameNode(id, name);
  revalidatePath("/");
  return node;
}

export async function deleteNode(id: string) {
  await requireAuth();
  await nodeService.deleteNode(id);
  revalidatePath("/");
}

export async function addSource(
  nodeId: string,
  type: "pdf" | "docx" | "txt" | "csv" | "md" | "html" | "xlsx" | "web" | "youtube",
  formData: FormData,
) {
  await requireAuth();

  const file = formData.get("file") as File | null;
  const url = formData.get("url") as string | null;

  await ingest({
    nodeId,
    type,
    file: file ? Buffer.from(await file.arrayBuffer()) : undefined,
    fileName: file?.name,
    url: url || undefined,
    name: file?.name || url || undefined,
  });

  revalidatePath(`/nodes/${nodeId}`);
}

export async function removeSource(sourceId: string, nodeId: string) {
  await requireAuth();
  await nodeService.removeSource(sourceId);
  revalidatePath(`/nodes/${nodeId}`);
}

export async function listSources(nodeId: string) {
  await requireAuth();
  return nodeService.listSources(nodeId);
}

export async function listMessages(nodeId: string) {
  await requireAuth();
  return nodeService.listMessages(nodeId);
}

export async function getSourceContent(sourceId: string) {
  await requireAuth();
  return nodeService.getSourceContent(sourceId);
}

export async function generateSummary(nodeId: string, type: SummaryType) {
  await requireAuth();
  return summarize(nodeId, type);
}
