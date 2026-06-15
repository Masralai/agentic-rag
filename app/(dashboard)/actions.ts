"use server";

import { requireAuth } from "@/modules/auth";
import { nodeService } from "@/modules/node";
import { processSource } from "@/modules/ingestion";
import { summarize, type SummaryType } from "@/modules/rag";
import { revalidatePath } from "next/cache";
import { mkdir, writeFile } from "fs/promises";

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
  const name = formData.get("name") as string | null;

  const source = await nodeService.addSource({
    nodeId,
    type,
    name: name || file?.name || url || "unknown",
    status: "pending",
  } as any);

  if (file) {
    const dir = `/tmp/psynapse/${source.id}`;
    await mkdir(dir, { recursive: true });
    await writeFile(`${dir}/${file.name}`, Buffer.from(await file.arrayBuffer()));
  }

  revalidatePath(`/nodes/${nodeId}`);
  return { sourceId: source.id };
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
