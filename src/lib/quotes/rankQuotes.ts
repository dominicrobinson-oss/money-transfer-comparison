import { Quote } from "@/types/core";

export interface RankedQuote extends Quote {
  bestRateToday?: boolean;
}

/**
 * Ranks quotes, prioritizing live data over mock data
 * - Live quotes are ranked first by receive amount
 * - Mock quotes are ranked after live quotes by receive amount
 * - Best rate today is assigned to the top live quote if any exist
 *
 * @param quotes - Array of Quote objects to rank
 * @returns Sorted array with best rate marked
 */
export function rankQuotes(quotes: Quote[]): RankedQuote[] {
  if (quotes.length === 0) {
    return [];
  }

  const sorted = [...quotes].sort((a, b) => {
    const aLive = a.source === "live" ? 1 : 0;
    const bLive = b.source === "live" ? 1 : 0;

    if (aLive !== bLive) {
      return bLive - aLive;
    }

    return b.receiveAmount - a.receiveAmount;
  });

  const hasLive = sorted.some((quote) => quote.source === "live");

  return sorted.map((quote, index) => ({
    ...quote,
    bestRateToday: hasLive ? quote.source === "live" && index === 0 : index === 0,
  }));
}
