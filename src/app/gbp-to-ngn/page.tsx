"use client";

import { useEffect, useState } from "react";
import { Quote } from "@/types/core";
import { rankQuotes, RankedQuote } from "@/lib/quotes/rankQuotes";
import { providers } from "@/lib/providers";
import Link from "next/link";

const LIVE_FETCH_TIMEOUT_MS = 2000;
const SEND_AMOUNT = 100;

// Mock quotes
const MOCK_QUOTES = {
  wise: {
    providerId: "wise",
    fromCurrency: "GBP" as const,
    toCurrency: "NGN" as const,
    sendAmount: SEND_AMOUNT,
    rate: 2050.5,
    fee: 3.5,
    receiveAmount: (SEND_AMOUNT - 3.5) * 2050.5,
    fetchedAt: new Date().toISOString(),
    source: "mock" as const,
  },
  remitly: {
    providerId: "remitly",
    fromCurrency: "GBP" as const,
    toCurrency: "NGN" as const,
    sendAmount: SEND_AMOUNT,
    rate: 2040.75,
    fee: 2.99,
    receiveAmount: (SEND_AMOUNT - 2.99) * 2040.75,
    fetchedAt: new Date().toISOString(),
    source: "mock" as const,
  },
  worldremit: {
    providerId: "worldremit",
    fromCurrency: "GBP" as const,
    toCurrency: "NGN" as const,
    sendAmount: SEND_AMOUNT,
    rate: 2035.25,
    fee: 3.99,
    receiveAmount: (SEND_AMOUNT - 3.99) * 2035.25,
    fetchedAt: new Date().toISOString(),
    source: "mock" as const,
  },
  sendwave: {
    providerId: "sendwave",
    fromCurrency: "GBP" as const,
    toCurrency: "NGN" as const,
    sendAmount: SEND_AMOUNT,
    rate: 2055.0,
    fee: 0,
    receiveAmount: SEND_AMOUNT * 2055.0,
    fetchedAt: new Date().toISOString(),
    source: "mock" as const,
  },
  taptapsend: {
    providerId: "taptapsend",
    fromCurrency: "GBP" as const,
    toCurrency: "NGN" as const,
    sendAmount: SEND_AMOUNT,
    rate: 2045.0,
    fee: 1.99,
    receiveAmount: (SEND_AMOUNT - 1.99) * 2045.0,
    fetchedAt: new Date().toISOString(),
    source: "mock" as const,
  },
};

export default function GbpToNgnPage() {
  const [quotes, setQuotes] = useState<Quote[]>(Object.values(MOCK_QUOTES));
  const [loadingProviders, setLoadingProviders] = useState<Set<string>>(
    new Set(["wise", "remitly"])
  );
  const [hasLiveQuotes, setHasLiveQuotes] = useState(false);

  useEffect(() => {
    // Fetch live quotes from API in background without blocking
    const fetchLiveQuotes = async () => {
      // Fetch Wise
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), LIVE_FETCH_TIMEOUT_MS);
        
        const res = await fetch("/api/quotes/live?provider=wise", {
          signal: controller.signal,
        });
        clearTimeout(timeout);
        
        if (res.ok) {
          const response = await res.json();
          if (response.status === "success" && response.data) {
            setQuotes((prev) =>
              prev.map((q) => (q.providerId === "wise" ? response.data : q))
            );
            if (response.data.source === "live") setHasLiveQuotes(true);
          }
        }
      } catch {
        // Ignore errors, keep mock
      } finally {
        setLoadingProviders((prev) => {
          const next = new Set(prev);
          next.delete("wise");
          return next;
        });
      }

      // Fetch Remitly
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), LIVE_FETCH_TIMEOUT_MS);
        
        const res = await fetch("/api/quotes/live?provider=remitly", {
          signal: controller.signal,
        });
        clearTimeout(timeout);
        
        if (res.ok) {
          const response = await res.json();
          if (response.status === "success" && response.data) {
            setQuotes((prev) =>
              prev.map((q) => (q.providerId === "remitly" ? response.data : q))
            );
            if (response.data.source === "live") setHasLiveQuotes(true);
          }
        }
      } catch {
        // Ignore errors, keep mock
      } finally {
        setLoadingProviders((prev) => {
          const next = new Set(prev);
          next.delete("remitly");
          return next;
        });
      }
    };

    fetchLiveQuotes();
  }, []);

  const rankedQuotes = rankQuotes(quotes);
  const liveQuote = rankedQuotes.find((quote) => quote.source === "live");
  const lastUpdated = liveQuote?.fetchedAt ?? rankedQuotes[0]?.fetchedAt;

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Best GBP to NGN rate today
        </h1>
        <p className="text-gray-600 mb-6">Sending £{SEND_AMOUNT} to Nigeria</p>

        {loadingProviders.size > 0 && (
          <div className="mb-4 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded">
            <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
            Fetching live rates…
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    You Receive
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Rate
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Fee
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rankedQuotes.map((quote: RankedQuote) => {
                  const provider = providers.find((p) => p.id === quote.providerId);
                  const isLoading = loadingProviders.has(quote.providerId);

                  return (
                    <tr
                      key={quote.providerId}
                      className={`hover:bg-gray-50 transition ${
                        isLoading ? "opacity-75" : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {provider?.name || quote.providerId}
                          {quote.bestRateToday && (
                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Best Rate
                            </span>
                          )}
                          {isLoading && (
                            <span className="inline-block w-1 h-1 bg-gray-400 rounded-full animate-pulse"></span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-gray-900">
                        ₦{quote.receiveAmount.toLocaleString("en-GB", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-4 text-right text-gray-700">
                        {quote.rate.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-right text-gray-700">
                        £{quote.fee.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/go/provider/${quote.providerId}?from=GBP&to=NGN&amount=${SEND_AMOUNT}`}
                          className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition disabled:opacity-50"
                        >
                          Send with {provider?.name}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Last updated:{" "}
          {lastUpdated
            ? new Date(lastUpdated).toLocaleString("en-GB", {
                timeZone: "Europe/London",
              })
            : "Unavailable"}
        </p>
      </div>
    </main>
  );
}
