import { test, expect } from "@playwright/test";
import path from "path";
import { writeFileSync, mkdirSync } from "fs";

test.describe("Authenticated feature flows", () => {
  test("create node, upload file, chat, toggle, study guide", async ({ page }) => {
    test.setTimeout(240_000);
    await page.goto("/nodes");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /create new node/i }).click();
    await expect(page.getByText("Create node")).toBeVisible();

    const nodeName = `E2E ${Date.now()}`;
    await page.locator("[role='dialog'] input").first().fill(nodeName);
    await page.getByRole("button", { name: /^create$/i }).click();
    await page.waitForURL(/\/nodes\//, { timeout: 20_000 });

    const tmpDir = "/tmp/psynapse-e2e";
    mkdirSync(tmpDir, { recursive: true });
    const filePath = path.join(tmpDir, "browser-e2e.txt");
    writeFileSync(
      filePath,
      "Browser E2E notes.\n\nBerlin is the capital of Germany.\n\nMadrid is the capital of Spain.",
    );

    await page.locator('aside input[type="file"]').setInputFiles(filePath);
    await expect(page.getByText("ready").first()).toBeVisible({ timeout: 120_000 });

    const chatInput = page.getByPlaceholder(/ask a question/i);
    await chatInput.fill("What is the capital of Germany according to the sources?");
    await chatInput.press("Enter");
    await expect(page.locator(".prose").last()).toBeVisible({ timeout: 120_000 });
    const answer = await page.locator(".prose").last().innerText();
    expect(answer.length).toBeGreaterThan(5);

    const checkbox = page.locator('aside input[type="checkbox"]').first();
    await expect(checkbox).toBeVisible();
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
    await checkbox.check();

    await page.getByRole("button", { name: /study guide/i }).click();
    await expect(
      page.getByText(/generated summary|study guide|key concepts/i).first(),
    ).toBeVisible({ timeout: 180_000 });

    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText(/generated summary|study guide|key concepts/i).first(),
    ).toBeVisible({ timeout: 30_000 });
  });

  test("URL source ingest reaches ready", async ({ page }) => {
    test.setTimeout(180_000);
    await page.goto("/nodes");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /create new node/i }).click();
    const nodeName = `URL E2E ${Date.now()}`;
    await page.locator("[role='dialog'] input").first().fill(nodeName);
    await page.getByRole("button", { name: /^create$/i }).click();
    await page.waitForURL(/\/nodes\//, { timeout: 20_000 });

    // Sidebar File/URL always visible now (even with empty sources)
    await page.getByRole("button", { name: /^URL$/i }).click();
    await page.getByPlaceholder("https://example.com").fill("https://example.com/");
    await page.getByRole("button", { name: /add url/i }).click();

    await expect(page.getByText("ready").first()).toBeVisible({ timeout: 90_000 });
    await expect(page.locator("aside").getByText(/ready|example|Example Domain/i).first()).toBeVisible();
  });
});
