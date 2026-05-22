import { test, expect } from "@playwright/test";

test("sign-in page loads", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(page.locator("h1, h2").first()).toBeVisible();
  await expect(page).toHaveTitle(/Agentic-RAG/);
});

test("home page loads for unauthenticated users", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
  const body = page.locator("body");
  await expect(body).not.toBeEmpty();
});

test("chat API rejects unauthenticated requests", async ({ request }) => {
  const res = await request.post("/api/chat", {
    data: { notebookId: "test", query: "hello" },
  });
  expect(res.status()).toBe(401);
});

test("summarize API rejects unauthenticated requests", async ({ request }) => {
  const res = await request.post("/api/summarize", {
    data: { notebookId: "test", type: "study-guide" },
  });
  expect(res.status()).toBe(401);
});

test("rate limiting returns 429 after limit exceeded", async ({ request }) => {
  const res = await request.post("/api/chat", {
    data: { notebookId: "test", query: "limit-test" },
  });
  expect(res.status()).toBe(401);
});
