/**
 * Fetch Live Quotes Script
 * 
 * Fetches live quotes for supported providers (GBP → NGN, amount 100)
 * Designed to be run via cron job
 * 
 * Usage:
 *   npx tsx src/scripts/fetch-live-quotes.ts
 */

import { Quote } from "@/types/core";
import { fetchWiseQuote } from "@/lib/quotes/fetchWiseQuote";
import { fetchRemitlyQuote } from "@/lib/quotes/fetchRemitlyQuote";
import { withTimeout } from "@/lib/utils/timeout";

const FETCH_TIMEOUT_MS = 15000;
const SEND_AMOUNT = 100;

interface FetchResult {
  provider: string;
  success: boolean;
  quote?: Quote;
  error?: string;
}

/**
 * Fetch live quotes from all providers
 * One provider failure does not stop others
 */
async function fetchLiveQuotes(): Promise<FetchResult[]> {
  const results: FetchResult[] = [];

  // Fetch Wise
  try {
    console.log("Fetching Wise quote...");
    const wiseQuote = await withTimeout(
      fetchWiseQuote(),
      FETCH_TIMEOUT_MS,
      null as any
    );

    if (wiseQuote) {
      results.push({
        provider: "wise",
        success: true,
        quote: wiseQuote,
      });
      console.log("✓ Wise quote fetched successfully");
    } else {
      results.push({
        provider: "wise",
        success: false,
        error: "Timeout or null response",
      });
      console.warn("✗ Wise quote returned null");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    results.push({
      provider: "wise",
      success: false,
      error: errorMessage,
    });
    console.error("✗ Wise quote fetch failed:", errorMessage);
  }

  // Fetch Remitly
  try {
    console.log("Fetching Remitly quote...");
    const remitlyQuote = await withTimeout(
      fetchRemitlyQuote(),
      FETCH_TIMEOUT_MS,
      null as any
    );

    if (remitlyQuote) {
      results.push({
        provider: "remitly",
        success: true,
        quote: remitlyQuote,
      });
      console.log("✓ Remitly quote fetched successfully");
    } else {
      results.push({
        provider: "remitly",
        success: false,
        error: "Timeout or null response",
      });
      console.warn("✗ Remitly quote returned null");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    results.push({
      provider: "remitly",
      success: false,
      error: errorMessage,
    });
    console.error("✗ Remitly quote fetch failed:", errorMessage);
  }

  return results;
}

/**
 * Main script execution
 */
async function main() {
  console.log("=".repeat(60));
  console.log("Starting live quote fetch job");
  console.log("Amount: £" + SEND_AMOUNT);
  console.log("Route: GBP → NGN");
  console.log("Timeout per provider: " + FETCH_TIMEOUT_MS + "ms");
  console.log("=".repeat(60));

  const startTime = Date.now();

  try {
    const results = await fetchLiveQuotes();

    const duration = Date.now() - startTime;
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    console.log("\n" + "=".repeat(60));
    console.log("Results:");
    console.log(`  Successful: ${successful.length}/${results.length}`);
    console.log(`  Failed: ${failed.length}/${results.length}`);
    console.log(`  Duration: ${duration}ms`);
    console.log("=".repeat(60));

    // Print successful quotes
    if (successful.length > 0) {
      console.log("\nSuccessful Quotes:");
      successful.forEach((result) => {
        if (result.quote) {
          console.log(`  ${result.provider}:`);
          console.log(`    Rate: ${result.quote.rate}`);
          console.log(`    Fee: £${result.quote.fee}`);
          console.log(`    Receive: ₦${result.quote.receiveAmount.toLocaleString()}`);
          console.log(`    Source: ${result.quote.source}`);
        }
      });
    }

    // Print failed providers
    if (failed.length > 0) {
      console.log("\nFailed Providers:");
      failed.forEach((result) => {
        console.log(`  ${result.provider}: ${result.error}`);
      });
    }

    // Exit with appropriate code
    process.exit(failed.length > 0 ? 1 : 0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

// Run script
main();
