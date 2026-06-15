import { test, expect } from "@playwright/test";

test.describe("Landing page UI", () => {
  test("has split-screen layout with terminal graphic", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Query your").first()).toBeVisible();
    await expect(page.getByText("documents").first()).toBeVisible();
    await expect(page.getByText("with language").first()).toBeVisible();

    await expect(page.getByText(/Upload PDFs, DOCX/).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /get started/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /learn more/i }).first()).toBeVisible();
  });

  test("features section has id anchor", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#features")).toBeVisible();
    await expect(page.locator("#features").locator("text=Ask questions across")).toBeVisible();
  });

  test("learn more scrolls to features", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("link", { name: /learn more/i }).click();
    await expect(page.locator("#features")).toBeVisible();
  });
});

test.describe("Sign-in page", () => {
  test("sign-in page renders", async ({ page }) => {
    await page.goto("/sign-in");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Page routing", () => {
  test("landing page shows for unauthenticated users", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Query your").first()).toBeVisible();
  });

  test("nodes page renders empty state", async ({ page }) => {
    await page.goto("/nodes");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Select a node").first()).toBeVisible();
  });
});

test.describe("Font loading", () => {
  test("Geist font is loaded", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const fontFamily = await page.evaluate(() =>
      getComputedStyle(document.body).fontFamily
    );
    expect(fontFamily.toLowerCase()).toContain("geist");
  });
});

test.describe("Visual elements", () => {
  test("grain overlay exists", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".grain")).toBeVisible();
  });
});

test.describe("Meta tags", () => {
  test("has correct viewport and title", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveTitle(/Psynapse/);
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      "content",
      /width=device-width/
    );
  });
});

test.describe("Accessibility basics", () => {
  test("skip link is present", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const skipLink = page.locator('a[href="#main"]');
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveText("Skip to main");
  });

  test("images have alt text or are decorative", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      if (alt === null) {
        const role = await img.getAttribute("role");
        const hidden = await img.getAttribute("aria-hidden");
        expect(role === "presentation" || hidden === "true").toBeTruthy();
      }
    }
  });
});
