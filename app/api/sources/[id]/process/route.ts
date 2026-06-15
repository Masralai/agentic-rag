import { requireAuth } from "@/modules/auth";
import { processSource } from "@/modules/ingestion";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await requireAuth();
    await processSource(id);
    return Response.json({ status: "ok" });
  } catch (error: any) {
    const message = error?.message || "Processing failed";
    const status = message === "Authentication required" ? 401 : 500;
    return Response.json({ status: "error", message }, { status });
  }
}
