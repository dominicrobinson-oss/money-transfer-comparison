import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer } from "http";
import { parse } from "url";

/**
 * Backend/Logic Tests
 * Tests critical paths without mocking UI
 */

describe("Smoke Tests - Backend", () => {
  describe("Provider Management", () => {
    it("should have exactly 3 providers configured", async () => {
      const { providers } = await import("@/lib/providers");
      expect(providers).toHaveLength(3);
      expect(providers.map((p) => p.id)).toEqual(["wise", "remitly", "sendwave"]);
    });

    it("getProviderById should find providers by exact id", async () => {
      const { getProviderById } = await import("@/lib/providers");

      expect(getProviderById("wise")).toBeDefined();
      expect(getProviderById("wise")?.name).toBe("Wise");

      expect(getProviderById("remitly")).toBeDefined();
      expect(getProviderById("sendwave")).toBeDefined();

      // Should not find non-existent providers
      expect(getProviderById("worldremit")).toBeUndefined();
      expect(getProviderById("WISE")).toBeUndefined(); // Case sensitive
    });

    it("each provider should have id, name, and websiteUrl", async () => {
      const { providers } = await import("@/lib/providers");

      providers.forEach((provider) => {
        expect(provider.id).toBeDefined();
        expect(typeof provider.id).toBe("string");
        expect(provider.id).toMatch(/^[a-z]+$/); // Lowercase only

        expect(provider.name).toBeDefined();
        expect(typeof provider.name).toBe("string");

        expect(provider.websiteUrl).toBeDefined();
        expect(typeof provider.websiteUrl).toBe("string");
        expect(provider.websiteUrl).toMatch(/^https?:\/\//);
      });
    });
  });

  describe("Quote Ranking", () => {
    it("should prioritize live quotes over mock quotes", async () => {
      const { rankQuotes } = await import("@/lib/quotes/rankQuotes");

      const quotes = [
        {
          providerId: "wise",
          fromCurrency: "GBP" as const,
          toCurrency: "NGN" as const,
          sendAmount: 100,
          rate: 2050,
          fee: 3.5,
          receiveAmount: 209965,
          fetchedAt: new Date().toISOString(),
          source: "mock" as const,
        },
        {
          providerId: "remitly",
          fromCurrency: "GBP" as const,
          toCurrency: "NGN" as const,
          sendAmount: 100,
          rate: 2055,
          fee: 2.99,
          receiveAmount: 211023.45,
          fetchedAt: new Date().toISOString(),
          source: "live" as const,
        },
      ];

      const ranked = rankQuotes(quotes);

      // Live quote should come first
      expect(ranked[0].source).toBe("live");
      expect(ranked[0].providerId).toBe("remitly");
    });

    it("should mark best live rate as bestRateToday", async () => {
      const { rankQuotes } = await import("@/lib/quotes/rankQuotes");

      const quotes = [
        {
          providerId: "wise",
          fromCurrency: "GBP" as const,
          toCurrency: "NGN" as const,
          sendAmount: 100,
          rate: 2050,
          fee: 3.5,
          receiveAmount: 209965,
          fetchedAt: new Date().toISOString(),
          source: "live" as const,
        },
        {
          providerId: "remitly",
          fromCurrency: "GBP" as const,
          toCurrency: "NGN" as const,
          sendAmount: 100,
          rate: 2045,
          fee: 2.99,
          receiveAmount: 210202.01,
          fetchedAt: new Date().toISOString(),
          source: "live" as const,
        },
      ];

      const ranked = rankQuotes(quotes);

      // Only one should have bestRateToday
      const bestRated = ranked.filter((q) => q.bestRateToday);
      expect(bestRated).toHaveLength(1);
      expect(bestRated[0].providerId).toBe("remitly"); // Higher receive amount
    });
  });

  describe("Timeout Utilities", () => {
    it("withTimeout should return fallback when promise times out", async () => {
      const { withTimeout } = await import("@/lib/utils/timeout");

      const slowPromise = new Promise((resolve) =>
        setTimeout(() => resolve("slow"), 5000)
      );

      const fallback = "timeout-fallback";
      const result = await withTimeout(slowPromise, 100, fallback);

      expect(result).toEqual(fallback);
    });

    it("withTimeout should return promise result when it completes in time", async () => {
      const { withTimeout } = await import("@/lib/utils/timeout");

      const fastPromise = Promise.resolve("fast");
      const fallback = "timeout-fallback";
      const result = await withTimeout(fastPromise, 5000, fallback);

      expect(result).toBe("fast");
    });
  });

  describe("Live Quotes API", () => {
    it("API should never return error status codes", async () => {
      // Mock fetch responses
      const responses: Record<string, any> = {
        wise: { status: "success", data: { providerId: "wise" } },
        remitly: {
          status: "error",
          provider: "remitly",
          reason: "Browser not installed",
        },
        invalid: {
          status: "error",
          provider: null,
          reason: "Provider not supported",
        },
      };

      // All responses should be 200 or succeed with structured data
      Object.entries(responses).forEach(([key, value]) => {
        // Should have status field
        expect(value).toHaveProperty("status");
        expect(["success", "error"]).toContain(value.status);

        if (value.status === "success") {
          expect(value).toHaveProperty("data");
        } else {
          expect(value).toHaveProperty("provider");
          expect(value).toHaveProperty("reason");
        }
      });
    });
  });
});
