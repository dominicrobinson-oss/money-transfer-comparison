import { test, expect, Page, BrowserContext } from "@playwright/test";

/**
 * End-to-End Smoke Tests
 * Validates critical user path without mocking
 * 
 * Architecture:
 * - Pages are client components ("use client")
 * - Metadata is in per-route layout.tsx files
 * - Tests validate rendered output, not timing
 */

test.describe("Smoke Tests - E2E", () => {
  // Increase timeout for all tests to 10s
  test.setTimeout(10000);

  test("1. Page renders with comparison table visible", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto("http://localhost:3000/gbp-to-ngn", { waitUntil: "load" });

    // Wait for table to be present and visible (explicit wait)
    await page.waitForSelector("table", { timeout: 10000 });
    const table = page.locator("table");
    await expect(table).toBeVisible({ timeout: 10000 });

    // Header should contain expected columns
    await expect(table.locator("thead")).toContainText("Provider");
    await expect(table.locator("thead")).toContainText("You Receive");
    await expect(table.locator("thead")).toContainText("Rate");
    await expect(table.locator("thead")).toContainText("Fee");
  });

  test("2. At least one provider row is visible with all required fields", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto("http://localhost:3000/gbp-to-ngn", { waitUntil: "load" });

    // Wait for the table to be present
    await page.waitForSelector("table", { timeout: 10000 });
    const table = page.locator("table");
    await expect(table).toBeVisible({ timeout: 10000 });

    // At least one provider row should exist
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // First row should have content in multiple cells (Provider, Amount, Rate, Fee, Button)
    const firstRow = rows.first();
    const cells = firstRow.locator("td");
    
    // Should have at least 5 cells
    const cellCount = await cells.count();
    expect(cellCount).toBeGreaterThanOrEqual(5);

    // Provider name cell should have text
    const providerCell = cells.first();
    const cellText = await providerCell.textContent();
    expect(cellText?.trim().length).toBeGreaterThan(0);
  });

  test("3. Clicking 'Send with Provider' has properly formed redirect link", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto("http://localhost:3000/gbp-to-ngn", { waitUntil: "load" });

    // Wait for table to render with explicit selector
    await page.waitForSelector("table", { timeout: 10000 });
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });

    // Find first provider button
    const firstButton = page.locator("table tbody tr").first().locator("a");
    const href = await firstButton.getAttribute("href");

    // Verify href format: /go/provider/{id}?from=GBP&to=NGN&amount=100
    expect(href).toMatch(/^\/go\/provider\/(wise|remitly|sendwave)\?/);
    expect(href).toContain("from=GBP");
    expect(href).toContain("to=NGN");
    expect(href).toContain("amount=100");

    // Verify the link is visible
    await expect(firstButton).toBeVisible();
  });

  test("4. Provider redirect returns 404 if provider not found", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Try to access non-existent provider
    const response = await page.goto(
      "http://localhost:3000/go/provider/nonexistent?from=GBP&to=NGN&amount=100",
      { waitUntil: "load" }
    );

    // Should return 404
    expect(response?.status()).toBe(404);
  });

  test("5. Page still renders even if live quote fetches fail", async ({
    page,
    context,
  }: {
    page: Page;
    context: BrowserContext;
  }) => {
    // Intercept and block live quote API to simulate failure
    await context.route("**/api/quotes/live*", (route: any) => {
      route.abort("failed");
    });

    await page.goto("http://localhost:3000/gbp-to-ngn", { waitUntil: "load" });

    // Page should still render with table visible (mock data fallback)
    await page.waitForSelector("table", { timeout: 10000 });
    const table = page.locator("table");
    await expect(table).toBeVisible({ timeout: 10000 });

    // At least one provider row should be visible
    const rows = page.locator("tbody tr");
    expect(await rows.count()).toBeGreaterThanOrEqual(1);
  });

  test("6. All three providers are present and have valid links", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto("http://localhost:3000/gbp-to-ngn", { waitUntil: "load" });

    // Wait for table to be present
    await page.waitForSelector("table", { timeout: 10000 });
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });

    const providerIds = ["wise", "remitly", "sendwave"];

    for (const providerId of providerIds) {
      // Find button for this provider
      const button = page.locator(
        `a[href*="/go/provider/${providerId}"]`
      );
      
      await expect(button).toBeVisible();

      // Verify href contains provider ID and query params
      const href = await button.getAttribute("href");
      expect(href).toContain(providerId);
      expect(href).toContain("from=GBP");
      expect(href).toContain("to=NGN");
    }
  });

  test("7. Loading indicator appears or data loads directly", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto("http://localhost:3000/gbp-to-ngn", { waitUntil: "load" });

    // Either the loading indicator appears momentarily, or the table renders directly
    // Both are valid outcomes - wait for the table to be visible
    await page.waitForSelector("table", { timeout: 10000 });
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });

    // Verify at least one row of data is visible
    const rows = page.locator("tbody tr");
    expect(await rows.count()).toBeGreaterThanOrEqual(1);
  });
});
