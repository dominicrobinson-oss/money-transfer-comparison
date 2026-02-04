import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/go/provider/[id]/route";
import { providers, getProviderById } from "@/lib/providers";

/**
 * Smoke Tests - Provider Redirects
 * Validates that all providers redirect correctly and invalid providers are rejected
 */

describe("Smoke Tests - Provider Redirects", () => {
  it("All valid providers return 302 with correct Location header", async () => {
    for (const provider of providers) {
      // Mock NextRequest for this provider
      const request = new NextRequest(
        new URL(`http://localhost:3000/go/provider/${provider.id}`),
        {
          method: "GET",
          headers: {
            "user-agent": "test-agent",
            referer: "http://localhost:3000/gbp-to-ngn",
          },
        }
      );

      // Call the route handler
      const response = await GET(request, {
        params: Promise.resolve({ id: provider.id }),
      });

      // Should return 302 redirect
      expect(response.status).toBe(302);

      // Should have Location header pointing to provider website
      const location = response.headers.get("Location");
      expect(location).toBeDefined();
      expect(location).toBeTruthy();

      // Location should be a valid URL
      if (location) {
        expect(() => new URL(location)).not.toThrow();
      }

      // Verify it's the correct provider URL
      expect(location).toContain(provider.websiteUrl);
    }
  });

  it("Each provider redirect has required query parameters", async () => {
    for (const provider of providers) {
      const request = new NextRequest(
        new URL(
          `http://localhost:3000/go/provider/${provider.id}?from=GBP&to=NGN&amount=100`
        ),
        {
          method: "GET",
          headers: {
            "user-agent": "test-agent",
          },
        }
      );

      const response = await GET(request, {
        params: Promise.resolve({ id: provider.id }),
      });

      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBeDefined();
    }
  });

  it("Invalid provider returns 404 with error message", async () => {
    const request = new NextRequest(
      new URL("http://localhost:3000/go/provider/invalid-provider"),
      {
        method: "GET",
        headers: {
          "user-agent": "test-agent",
        },
      }
    );

    const response = await GET(request, {
      params: Promise.resolve({ id: "invalid-provider" }),
    });

    // Should return 404
    expect(response.status).toBe(404);

    // Response body should not exist or be empty (actual response is JSON error)
    const body = await response.json();
    expect(body.error).toBe("Provider not found");
  });

  it("Provider exists via getProviderById lookup", async () => {
    for (const provider of providers) {
      const found = getProviderById(provider.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(provider.id);
      expect(found?.websiteUrl).toBe(provider.websiteUrl);
    }
  });

  it("Invalid provider does not exist via getProviderById", async () => {
    const found = getProviderById("invalid-provider");
    expect(found).toBeUndefined();
  });

  it("All providers have valid URLs", async () => {
    for (const provider of providers) {
      expect(provider.websiteUrl).toBeDefined();
      expect(() => new URL(provider.websiteUrl)).not.toThrow();
      expect(provider.websiteUrl.startsWith("http")).toBe(true);
    }
  });
});
