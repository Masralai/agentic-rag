import { describe, it, expect, beforeAll, vi } from "vitest";
import { POST } from "@/app/api/sources/[id]/process/route";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";

const hasDb = !!process.env.DATABASE_URL;

describe("POST /api/sources/[id]/process", () => {
  beforeAll(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    (auth as any).mockResolvedValue({ userId: null });

    const response = await POST(
      new Request("http://localhost/api/sources/fake-id/process"),
      { params: Promise.resolve({ id: "fake-id" }) },
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.status).toBe("error");
    expect(body.message).toBe("Authentication required");
  });

  it.runIf(hasDb)("returns error JSON with 404 when source is missing", async () => {
    (auth as any).mockResolvedValue({ userId: "test-user" });

    const response = await POST(
      new Request("http://localhost/api/sources/00000000-0000-0000-0000-000000000000/process"),
      { params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000000" }) },
    );

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.status).toBe("error");
    expect(body.message).toBe("Source not found");
  }, 15000);
});
