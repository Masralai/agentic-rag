import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { test as setup, expect } from "@playwright/test";

setup("global setup", async () => {
  await clerkSetup();
});

setup("authenticate", async ({ page }) => {
  await page.goto("/");
  await clerk.signIn({
    page,
    emailAddress: process.env.E2E_CLERK_USER_EMAIL || "devdeeppaul2004@gmail.com",
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  // Authenticated users should leave the marketing landing (or see dashboard chrome)
  await page.context().storageState({ path: "playwright/.clerk/user.json" });
});
