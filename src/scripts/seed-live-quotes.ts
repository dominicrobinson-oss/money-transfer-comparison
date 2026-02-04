/**
 * Seed Live Quotes Script
 *
 * Inserts test live quotes into the database for development/testing
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

    // Wise quote - realistic values
    const wiseQuote: Quote = {
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

    // Remitly quote - realistic values
    const remitlyQuote: Quote = {
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

    console.log("\nInserting Wise quote...");
    await saveLiveQuote(wiseQuote);
    console.log(`✓ Wise: £${wiseQuote.sendAmount} → ₦${wiseQuote.receiveAmount.toFixed(2)}`);
    console.log(`  Rate: ${wiseQuote.rate}, Fee: £${wiseQuote.fee}`);

    console.log("\nInserting Remitly quote...");
    await saveLiveQuote(remitlyQuote);
    console.log(
      `✓ Remitly: £${remitlyQuote.sendAmount} → ₦${remitlyQuote.receiveAmount.toFixed(2)}`
    );
    console.log(`  Rate: ${remitlyQuote.rate}, Fee: £${remitlyQuote.fee}`);

    console.log("\n============================================================");
    console.log(`✓ Successfully seeded ${2} live quotes`);
    console.log(`  Timestamp: ${now}`);
    console.log("============================================================");
    process.exit(0);
  } catch (error) {
    console.error("\n✗ Error seeding quotes:", error);
    process.exit(1);
  }
}

seedLiveQuotes();
