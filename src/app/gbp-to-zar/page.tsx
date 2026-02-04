"use client";

import { useEffect, useState } from "react";
import { Quote } from "@/types/core";
import { rankQuotes, RankedQuote } from "@/lib/quotes/rankQuotes";
import { formatNumber, formatNumberLocale } from "@/lib/utils/format";
import { providers } from "@/lib/providers";
import Link from "next/link";

const LIVE_FETCH_TIMEOUT_MS = 2000;
const DEFAULT_SEND_AMOUNT = 100;
const FROM_CURRENCY = "GBP";
const TO_CURRENCY = "ZAR";
const MOCK_TIMESTAMP = "2025-02-04T12:00:00Z";

// Mock quotes for GBP → ZAR
const MOCK_QUOTES = {
  wise: {
    providerId: "wise",
    fromCurrency: "GBP" as const,
    toCurrency: "ZAR" as const,
    sendAmount: DEFAULT_SEND_AMOUNT,
    rate: 26.45,
    fee: 3.5,
    receiveAmount: (DEFAULT_SEND_AMOUNT - 3.5) * 26.45,
    fetchedAt: MOCK_TIMESTAMP,
    source: "mock" as const,
  },
  remitly: {
    providerId: "remitly",
    fromCurrency: "GBP" as const,
    toCurrency: "ZAR" as const,
    sendAmount: DEFAULT_SEND_AMOUNT,
    rate: 26.20,
    fee: 2.99,
    receiveAmount: (DEFAULT_SEND_AMOUNT - 2.99) * 26.20,
    fetchedAt: MOCK_TIMESTAMP,
    source: "mock" as const,
  },
  worldremit: {
    providerId: "worldremit",
    fromCurrency: "GBP" as const,
    toCurrency: "ZAR" as const,
    sendAmount: DEFAULT_SEND_AMOUNT,
    rate: 26.05,
    fee: 3.99,
    receiveAmount: (DEFAULT_SEND_AMOUNT - 3.99) * 26.05,
    fetchedAt: MOCK_TIMESTAMP,
    source: "mock" as const,
  },
  sendwave: {
    providerId: "sendwave",
    fromCurrency: "GBP" as const,
    toCurrency: "ZAR" as const,
    sendAmount: DEFAULT_SEND_AMOUNT,
    rate: 26.55,
    fee: 0,
    receiveAmount: DEFAULT_SEND_AMOUNT * 26.55,
    fetchedAt: MOCK_TIMESTAMP,
    source: "mock" as const,
  },
  taptapsend: {
    providerId: "taptapsend",
    fromCurrency: "GBP" as const,
    toCurrency: "ZAR" as const,
    sendAmount: DEFAULT_SEND_AMOUNT,
    rate: 26.35,
    fee: 1.99,
    receiveAmount: (DEFAULT_SEND_AMOUNT - 1.99) * 26.35,
    fetchedAt: MOCK_TIMESTAMP,
    source: "mock" as const,
  },
};

export default function GbpToZarPage() {
  const [sendAmount, setSendAmount] = useState<number>(DEFAULT_SEND_AMOUNT);
  const [quotes, setQuotes] = useState<Quote[]>(
    Object.values(MOCK_QUOTES) as Quote[]
  );
  const [loadingProviders, setLoadingProviders] = useState<Set<string>>(
    new Set(["wise", "remitly"])
  );
  const [hasLiveQuotes, setHasLiveQuotes] = useState(false);
  const [formattedLastUpdated, setFormattedLastUpdated] = useState<string>("—");

  const getRecalculatedQuotes = (amount: number): Quote[] => {
    if (amount <= 0) return quotes;
    
    return quotes.map((quote) => ({
      ...quote,
      sendAmount: amount,
      receiveAmount: Math.max(0, (amount - quote.fee) * quote.rate),
    }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || DEFAULT_SEND_AMOUNT;
    setSendAmount(value);
    setQuotes(getRecalculatedQuotes(value));
  };

  useEffect(() => {
    const fetchLiveQuotes = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), LIVE_FETCH_TIMEOUT_MS);
        
        const res = await fetch(`/api/quotes/live?from=${FROM_CURRENCY}&to=${TO_CURRENCY}`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);
        
        if (res.ok) {
          const response = await res.json();
          if (response.status === "success" && response.data && Array.isArray(response.data)) {
            setQuotes((prev) => {
              const liveQuotes = response.data;
              return prev.map((q) => {
                const liveQuote = liveQuotes.find((lq: Quote) => lq.providerId === q.providerId);
                return liveQuote || q;
              });
            });
          }
        }
      } catch {
        // Ignore errors, keep mock
      }
    };

    fetchLiveQuotes();
  }, []);

  useEffect(() => {
    const rankedQuotes = rankQuotes(quotes);
    const liveQuote = rankedQuotes.find((quote) => quote.source === "live");
    const lastUpdated = liveQuote?.fetchedAt ?? rankedQuotes[0]?.fetchedAt;

    if (lastUpdated) {
      try {
        const formatted = new Date(lastUpdated).toLocaleString("en-GB", {
          timeZone: "Europe/London",
        });
        setFormattedLastUpdated(formatted);
      } catch {
        setFormattedLastUpdated("—");
      }
    } else {
      setFormattedLastUpdated("—");
    }
  }, [quotes]);

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Best GBP to ZAR rate today
        </h1>
        
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How much do you want to send?
          </label>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-700">£</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={sendAmount}
              onChange={handleAmountChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              placeholder="100"
            />
          </div>
        </div>

        <p className="text-gray-600 mb-6">Sending £{formatNumber(sendAmount, 2)} to South Africa</p>

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
                {rankQuotes(quotes).map((quote: RankedQuote, index: number) => {
                  const provider = providers.find((p) => p.id === quote.providerId);
                  const isLoading = loadingProviders.has(quote.providerId);
                  const itemKey = quote.providerId && quote.fromCurrency && quote.toCurrency
                    ? `${quote.providerId}-${quote.fromCurrency}-${quote.toCurrency}`
                    : index;

                  return (
                    <tr
                      key={itemKey}
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
                        R{formatNumberLocale(quote.receiveAmount, 2)}
                      </td>
                      <td className="px-4 py-4 text-right text-gray-700">
                        {formatNumber(quote.rate, 2)}
                      </td>
                      <td className="px-4 py-4 text-right text-gray-700">
                        £{formatNumber(quote.fee, 2)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/go/provider/${quote.providerId}?from=${FROM_CURRENCY}&to=${TO_CURRENCY}&amount=${sendAmount}`}
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
          Last updated: {formattedLastUpdated}
        </p>

        {/* Disclaimer Section */}
        <section className="mt-12 border-t pt-8 bg-amber-50 border-amber-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-amber-900 mb-3">Disclaimer & Important Information</h3>
          <ul className="space-y-2 text-sm text-amber-800">
            <li className="flex gap-2">
              <span className="font-semibold">•</span>
              <span><strong>Indicative Rates:</strong> All rates shown are indicative and may change at any time. These are not guaranteed prices.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">•</span>
              <span><strong>Final Amount:</strong> The actual amount the recipient receives is determined by the provider at the time of transfer and may differ from the quoted amount.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">•</span>
              <span><strong>No Financial Advice:</strong> This comparison tool is for informational purposes only. This is not financial advice. Please do your own research before choosing a provider.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">•</span>
              <span><strong>Referral Disclosure:</strong> We may earn referral fees when you use providers linked from this site. This does not affect the rates you receive.</span>
            </li>
          </ul>
        </section>
        <section className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Which provider offers the best GBP to ZAR rate?</h3>
              <p className="text-gray-700">The best rate varies daily based on market conditions. Our comparison page shows live rates from trusted providers updated regularly. Most users find Wise and Remitly offer competitive rates with low fees.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How much does it cost to send money GBP to South Africa?</h3>
              <p className="text-gray-700">Fees depend on the provider and transfer method. Wise typically charges £1–3 for transfers, while Remitly charges 2–4% of the transfer amount. Check the comparison table above for current rates and fees.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How long does a GBP to ZAR transfer take?</h3>
              <p className="text-gray-700">Most providers deliver within 1–2 business days. Wise is known for faster transfers, often completing within 24 hours. Transfer speed may vary based on bank processing times and recipient bank.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Are these providers safe and regulated?</h3>
              <p className="text-gray-700">Yes. All providers listed are regulated by the Financial Conduct Authority (FCA) in the UK and operate under strict compliance standards. Always verify provider credentials before sending money.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
