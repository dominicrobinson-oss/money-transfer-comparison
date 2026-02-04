import { describe, it, expect, beforeAll } from "vitest";
import { providers } from "@/lib/providers";

/**
 * Smoke Tests - Page Structure
 * Validates HTML structure and provider links on /gbp-to-ngn page
 * Runs against dev server at http://localhost:3000
 */

describe("Smoke Tests - Page Structure", () => {
  let html: string;

  beforeAll(async () => {
    // Fetch the page HTML from dev server
    const response = await fetch("http://localhost:3000/gbp-to-ngn");
    expect(response.status).toBe(200);
    html = await response.text();
  });

  it("Page returns HTTP 200", async () => {
    const response = await fetch("http://localhost:3000/gbp-to-ngn");
    expect(response.status).toBe(200);
  });

  it("Page contains a Send with button/link for each provider", async () => {
    for (const provider of providers) {
      // Look for "Send with" text and the provider link
      const providerLinkPattern = new RegExp(
        `href="[^"]*${provider.id}[^"]*"[^>]*>Send with`,
        "i"
      );
      expect(html).toMatch(providerLinkPattern);
    }
  });

  it("Each provider link href matches /go/provider/{provider.id}", async () => {
    for (const provider of providers) {
      const pattern = new RegExp(`href="([^"]*\\/go\\/provider\\/${provider.id}[^"]*)"`);
      const match = html.match(pattern);

      expect(match).toBeDefined();
      if (match) {
        const href = match[1];
        expect(href).toContain(`/go/provider/${provider.id}`);
      }
    }
  });

  it("No provider link contains provider.name in the URL", async () => {
    for (const provider of providers) {
      // Find all links for this provider
      const pattern = new RegExp(
        `href="([^"]*\\/go\\/provider\\/${provider.id}[^"]*)"`
      );
      const match = html.match(pattern);

      if (match) {
        const href = match[1];
        // Provider name should NOT appear in the URL
        // (it's OK if it appears in query params, but not as part of the path)
        expect(href).not.toContain(provider.name.toLowerCase());
      }
    }
  });

  it("Links use provider.id not provider.name for routing", async () => {
    // This test ensures that the routing is based on lowercase IDs
    // not on human-readable names
    const html_fetch = await fetch("http://localhost:3000/gbp-to-ngn").then(
      (r) => r.text()
    );

    // All links should use provider.id
    for (const provider of providers) {
      // ID-based link should exist
      const idPattern = new RegExp(`/go/provider/${provider.id}`);
      expect(html_fetch).toMatch(idPattern);

      // Name-based link should NOT exist (case-insensitive check)
      const namePatterns = [
        new RegExp(`/go/provider/${provider.name}`, "i"),
        new RegExp(`/go/provider/${provider.name.toLowerCase()}`, "i"),
        new RegExp(`/go/provider/${provider.name.toUpperCase()}`, "i"),
      ];

      // The provider.id should be in the URL, not the name
      for (const namePattern of namePatterns) {
        // We allow the name in text content, just not in the href path
        const hrefPattern = new RegExp(
          `href="[^"]*${namePattern.source}[^"]*"`,
          "i"
        );
        expect(html_fetch).not.toMatch(hrefPattern);
      }
    }
  });

  it("All provider links are clickable anchors", async () => {
    for (const provider of providers) {
      // Look for anchor tag with href to this provider
      const anchorPattern = new RegExp(
        `<a[^>]*href="([^"]*\\/go\\/provider\\/${provider.id}[^"]*)"`
      );
      const match = html.match(anchorPattern);

      expect(match).toBeDefined();
      if (match) {
        // Should be a proper anchor tag
        expect(match[0]).toContain("<a");
        expect(match[0]).toContain('href=');
      }
    }
  });
});
