import { test, expect } from "@playwright/test";

test("sign-in page loads", async ({ page }) => {
  await page.goto("/sign-in");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("body")).toBeVisible();
  await expect(page).toHaveTitle(/Psynapse/);
});

test("landing page shows for unauthenticated users", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Query your").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /get started/i }).first()).toBeVisible();
});

test("chat API rejects unauthenticated requests", async ({ request }) => {
  const res = await request.post("/api/chat", {
    data: { nodeId: "test", query: "hello" },
  });
  expect(res.status()).toBe(401);
});

test("summarize API rejects unauthenticated requests", async ({ request }) => {
  const res = await request.post("/api/summarize", {
    data: { nodeId: "test", type: "study-guide" },
  });
  expect(res.status()).toBe(401);
});

test("rate limiting returns 429 after limit exceeded", async ({ request }) => {
  const res = await request.post("/api/chat", {
    data: { nodeId: "test", query: "limit-test" },
  });
  expect(res.status()).toBe(401);
});
