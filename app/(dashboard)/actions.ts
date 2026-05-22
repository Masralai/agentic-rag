"use server";

import { requireAuth } from "@/modules/auth";
import { notebookService } from "@/modules/notebook";
import { ingest } from "@/modules/ingestion";
import { summarize, type SummaryType } from "@/modules/rag";
import { revalidatePath } from "next/cache";

export async function createNotebook(name: string) {
  const { userId } = await requireAuth();
  const notebook = await notebookService.createNotebook(userId, name);
  revalidatePath("/");
  return notebook;
}

export async function listNotebooks() {
  const { userId } = await requireAuth();
  return notebookService.listNotebooks(userId);
}

export async function renameNotebook(id: string, name: string) {
  await requireAuth();
  const notebook = await notebookService.renameNotebook(id, name);
  revalidatePath("/");
  return notebook;
}

export async function deleteNotebook(id: string) {
  await requireAuth();
  await notebookService.deleteNotebook(id);
  revalidatePath("/");
}

export async function addSource(
  notebookId: string,
  type: "pdf" | "docx" | "txt" | "web" | "youtube",
  formData: FormData,
) {
  await requireAuth();

  const file = formData.get("file") as File | null;
  const url = formData.get("url") as string | null;

  await ingest({
    notebookId,
    type,
    file: file ? Buffer.from(await file.arrayBuffer()) : undefined,
    fileName: file?.name,
    url: url || undefined,
    name: file?.name || url || undefined,
  });

  revalidatePath(`/notebooks/${notebookId}`);
}

export async function removeSource(sourceId: string, notebookId: string) {
  await requireAuth();
  await notebookService.removeSource(sourceId);
  revalidatePath(`/notebooks/${notebookId}`);
}

export async function listSources(notebookId: string) {
  await requireAuth();
  return notebookService.listSources(notebookId);
}

export async function listMessages(notebookId: string) {
  await requireAuth();
  return notebookService.listMessages(notebookId);
}

export async function generateSummary(notebookId: string, type: SummaryType) {
  await requireAuth();
  return summarize(notebookId, type);
}
