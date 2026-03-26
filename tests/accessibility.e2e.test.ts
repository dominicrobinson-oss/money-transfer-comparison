import { test, expect } from "@playwright/test";

// Not-found page for invalid corridor

test.describe("Corridor Not Found Page", () => {
  test("shows 404 page for invalid corridor", async ({ page }) => {
    await page.goto("http://localhost:3000/gbp-to-xyz", { waitUntil: "load" });
    await expect(page.locator("h1")).toContainText("404");
    await expect(page.locator("text=Sorry, the page or corridor you are looking for does not exist.")).toBeVisible();
    await expect(page.locator("a", { hasText: "Go Home" })).toBeVisible();
  });
});

// Provider logo accessibility

test.describe("Provider Logo Accessibility", () => {
  test("provider logos have alt text and are visible", async ({ page }) => {
    await page.goto("http://localhost:3000/gbp-to-ngn", { waitUntil: "load" });
    const logos = page.locator('img[alt$="logo"]');
    await expect(logos).toHaveCountGreaterThan(0);
    const count = await logos.count();
    for (let i = 0; i < count; i++) {
      const alt = await logos.nth(i).getAttribute("alt");
      expect(alt).toMatch(/logo/i);
      await expect(logos.nth(i)).toBeVisible();
    }
  });
});
