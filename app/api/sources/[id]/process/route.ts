import { requireAuth } from "@/modules/auth";
import { processSource } from "@/modules/ingestion";
import { nodeService } from "@/modules/node";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const { userId } = await requireAuth();
    const source = await nodeService.getSource(id);
    if (!source) {
      return Response.json({ status: "error", message: "Source not found" }, { status: 404 });
    }
    await nodeService.assertNodeOwner(source.nodeId, userId);
    await processSource(id);
    return Response.json({ status: "ok" });
  } catch (error: any) {
    const message = error?.message || "Processing failed";
    const status =
      message === "Authentication required" ? 401 :
      message === "Forbidden" ? 403 : 500;
    return Response.json({ status: "error", message }, { status });
  }
}
