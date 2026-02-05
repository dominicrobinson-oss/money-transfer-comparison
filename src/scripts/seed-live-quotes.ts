/**
 * Seed Live Quotes Script
 *
 * Inserts test live quotes into the database for development/testing
 * Seeds quotes for multiple corridors (GBP → NGN, GBP → GHS)
 *
 * Usage:
 *   npx tsx src/scripts/seed-live-quotes.ts
 */

import { Quote } from "@/types/core";
import { saveLiveQuote, ensureDbInitialized } from "@/lib/db";

const SEND_AMOUNT = 100;

async function seedLiveQuotes() {
  console.log("============================================================");
  console.log("Seeding live quotes into database");
  console.log("============================================================");

  try {
    // Ensure database is initialized first
    await ensureDbInitialized();

    const now = new Date().toISOString();
    const quotes: Quote[] = [];

    // GBP → NGN corridor
    const wiseNgnQuote: Quote = {
      providerId: "wise",
      fromCurrency: "GBP",
      toCurrency: "NGN",
      sendAmount: SEND_AMOUNT,
      rate: 650.5,
      fee: 1.29,
      receiveAmount: 64924.21,
      fetchedAt: now,
      source: "live",
    };
    quotes.push(wiseNgnQuote);

    const remitlyNgnQuote: Quote = {
      providerId: "remitly",
      fromCurrency: "GBP",
      toCurrency: "NGN",
      sendAmount: SEND_AMOUNT,
      rate: 648.25,
      fee: 3.5,
      receiveAmount: 64471.75,
      fetchedAt: now,
      source: "live",
    };
    quotes.push(remitlyNgnQuote);

    // GBP → GHS corridor
    const wiseGhsQuote: Quote = {
      providerId: "wise",
      fromCurrency: "GBP",
      toCurrency: "GHS",
      sendAmount: SEND_AMOUNT,
      rate: 9.25,
      fee: 1.29,
      receiveAmount: 867.46,
      fetchedAt: now,
      source: "live",
    };
    quotes.push(wiseGhsQuote);

    const remitlyGhsQuote: Quote = {
      providerId: "remitly",
      fromCurrency: "GBP",
      toCurrency: "GHS",
      sendAmount: SEND_AMOUNT,
      rate: 9.18,
      fee: 3.5,
      receiveAmount: 847.94,
      fetchedAt: now,
      source: "live",
    };
    quotes.push(remitlyGhsQuote);

    // Insert all quotes
    console.log("\nInserting quotes...");

    for (const quote of quotes) {
      const toCurrency = quote.toCurrency === "NGN" ? "₦" : "₵";
      console.log(
        `✓ ${quote.providerId.charAt(0).toUpperCase() + quote.providerId.slice(1)}: £${quote.sendAmount} → ${toCurrency}${quote.receiveAmount.toFixed(2)}`
      );
      console.log(
        `  Rate: ${quote.rate}, Fee: £${quote.fee} (${quote.fromCurrency} → ${quote.toCurrency})`
      );
      await saveLiveQuote(quote);
    }

    console.log("\n============================================================");
    console.log(`✓ Successfully seeded ${quotes.length} live quotes`);
    console.log(`  Timestamp: ${now}`);
    console.log("  Coverage: GBP→NGN (wise, remitly), GBP→GHS (wise, remitly)");
    console.log("============================================================");
    process.exit(0);
  } catch (error) {
    console.error("\n✗ Error seeding quotes:", error);
    process.exit(1);
  }
}

seedLiveQuotes();
