"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Quote } from "@/types/core";
import { corridors, getCorridorByPair } from "@/lib/corridors";
import { rankQuotes, RankedQuote } from "@/lib/quotes/rankQuotes";
import { formatNumber, formatNumberLocale } from "@/lib/utils/format";
import { providers } from "@/lib/providers";
import { trackCorridorView, trackAmountChange, trackCurrencySelect } from "@/lib/telemetry";
import Link from "next/link";

const FROM_CURRENCY = "GBP" as const;
const TO_CURRENCY = "CAD" as const;

const LIVE_FETCH_TIMEOUT_MS = 2000;
const DEFAULT_SEND_AMOUNT = 100;
const MOCK_TIMESTAMP = "2025-02-04T12:00:00Z";

// Mock quotes for GBP → CAD
const MOCK_QUOTES = {
  wise: {
    providerId: "wise",
    fromCurrency: "GBP" as const,
    toCurrency: "CAD" as const,
    sendAmount: DEFAULT_SEND_AMOUNT,
    rate: 1.72,
    fee: 3.5,
    receiveAmount: (DEFAULT_SEND_AMOUNT - 3.5) * 1.72,
    fetchedAt: MOCK_TIMESTAMP,
    source: "mock" as const,
  },
  remitly: {
    providerId: "remitly",
    fromCurrency: "GBP" as const,
    toCurrency: "CAD" as const,
    sendAmount: DEFAULT_SEND_AMOUNT,
    rate: 1.71,
    fee: 2.99,
    receiveAmount: (DEFAULT_SEND_AMOUNT - 2.99) * 1.71,
    fetchedAt: MOCK_TIMESTAMP,
    source: "mock" as const,
  },
  worldremit: {
    providerId: "worldremit",
    fromCurrency: "GBP" as const,
    toCurrency: "CAD" as const,
    sendAmount: DEFAULT_SEND_AMOUNT,
    rate: 1.70,
    fee: 3.99,
    receiveAmount: (DEFAULT_SEND_AMOUNT - 3.99) * 1.70,
    fetchedAt: MOCK_TIMESTAMP,
    source: "mock" as const,
  },
  sendwave: {
    providerId: "sendwave",
    fromCurrency: "GBP" as const,
    toCurrency: "CAD" as const,
    sendAmount: DEFAULT_SEND_AMOUNT,
    rate: 1.73,
    fee: 0,
    receiveAmount: DEFAULT_SEND_AMOUNT * 1.73,
    fetchedAt: MOCK_TIMESTAMP,
    source: "mock" as const,
  },
  taptapsend: {
    providerId: "taptapsend",
    fromCurrency: "GBP" as const,
    toCurrency: "CAD" as const,
    sendAmount: DEFAULT_SEND_AMOUNT,
    rate: 1.72,
    fee: 1.99,
    receiveAmount: (DEFAULT_SEND_AMOUNT - 1.99) * 1.72,
    fetchedAt: MOCK_TIMESTAMP,
    source: "mock" as const,
  },
};

export default function GbpToCadPage() {
  const router = useRouter();
  const [sendAmount, setSendAmount] = useState<string>(String(DEFAULT_SEND_AMOUNT));
  const [selectedCurrency, setSelectedCurrency] = useState<string>(TO_CURRENCY);
  const [quotes, setQuotes] = useState<Quote[]>(
    Object.values(MOCK_QUOTES) as Quote[]
  );
  const [loadingProviders, setLoadingProviders] = useState<Set<string>>(
    new Set(["wise", "remitly"])
  );
  const [hasLiveQuotes, setHasLiveQuotes] = useState(false);
  const [formattedLastUpdated, setFormattedLastUpdated] = useState<string>("—");
  const [rateFreshnessLabel, setRateFreshnessLabel] = useState<string>("—");
  
  const amountChangeTimeout = useRef<NodeJS.Timeout | null>(null);

  const corridorOptions = corridors.filter(
    (corridor) => corridor.fromCurrency === FROM_CURRENCY
  );

  const corridor = getCorridorByPair(FROM_CURRENCY, TO_CURRENCY);
  const isActive = corridor?.status === "active";

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const currency = e.target.value;
    setSelectedCurrency(currency);
    const selected = corridorOptions.find((option) => option.toCurrency === currency);
    if (selected?.status === "active") {
      trackCurrencySelect(FROM_CURRENCY, selected.toCurrency);
      router.push(`/gbp-to-${selected.toCurrency.toLowerCase()}`);
    }
  };

  const getRecalculatedQuotes = (amountStr: string): Quote[] => {
    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0) return quotes;
    
    return quotes.map((quote) => ({
      ...quote,
      sendAmount: amount,
      receiveAmount: Math.max(0, (amount - quote.fee) * quote.rate),
    }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSendAmount(value);
    // Recalculate quotes instantly based on new amount (only if valid)
    if (value && parseFloat(value) > 0) {
      setQuotes(getRecalculatedQuotes(value));
      
      // Debounced telemetry tracking
      if (amountChangeTimeout.current) {
        clearTimeout(amountChangeTimeout.current);
      }
      amountChangeTimeout.current = setTimeout(() => {
        trackAmountChange(parseFloat(value));
      }, 1000);
    }
  };

  const handleAmountBlur = () => {
    // Default to DEFAULT_SEND_AMOUNT if empty or invalid
    if (!sendAmount || parseFloat(sendAmount) <= 0) {
      setSendAmount(String(DEFAULT_SEND_AMOUNT));
      setQuotes(getRecalculatedQuotes(String(DEFAULT_SEND_AMOUNT)));
    }
  };

  // Track corridor view on mount
  useEffect(() => {
    trackCorridorView(FROM_CURRENCY, TO_CURRENCY);
  }, []);

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
        const parsed = new Date(lastUpdated);
        const formatted = parsed.toLocaleString("en-GB", {
          timeZone: "Europe/London",
        });
        setFormattedLastUpdated(formatted);

        if (!Number.isNaN(parsed.getTime())) {
          const diffMinutes = Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 60000));
          if (diffMinutes < 60) {
            const minuteLabel = diffMinutes === 1 ? "minute" : "minutes";
            setRateFreshnessLabel(`${diffMinutes} ${minuteLabel} ago`);
          } else {
            const hours = Math.floor(diffMinutes / 60);
            const hourLabel = hours === 1 ? "hour" : "hours";
            setRateFreshnessLabel(`${hours} ${hourLabel} ago`);
          }
        } else {
          setRateFreshnessLabel("—");
        }
      } catch {
        setFormattedLastUpdated("—");
        setRateFreshnessLabel("—");
      }
    } else {
      setFormattedLastUpdated("—");
      setRateFreshnessLabel("—");
    }
  }, [quotes]);

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Best GBP to CAD rate today
        </h1>
        
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How much do you want to send?
          </label>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-700">£</span>
            <input
              type="number"
              min="1"
              step="1"
              value={sendAmount}
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              placeholder="100"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Amount in British Pounds (GBP)</p>
        </div>

        {/* Currency Selector */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <label htmlFor="currency-select" className="block text-sm font-medium text-gray-700 mb-2">
            Send to
          </label>
          <select
            id="currency-select"
            value={selectedCurrency}
            onChange={handleCurrencyChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          >
            {corridorOptions.map((option) => {
              const suffix = option.status === "active"
                ? ""
                : option.status === "coming-soon"
                  ? " (Coming soon)"
                  : " (Informational)";
              return (
                <option
                  key={option.id}
                  value={option.toCurrency}
                  disabled={option.status !== "active"}
                >
                  {option.label}{suffix}
                </option>
              );
            })}
          </select>
        </div>

        <p className="text-gray-600 mb-6">Sending £{formatNumber(parseFloat(sendAmount) || 0, 2)} to Canada</p>

        {isActive ? (
          <>
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
                              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                                Estimated
                              </span>
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
                            C${formatNumberLocale(quote.receiveAmount, 2)}
                          </td>
                          <td className="px-4 py-4 text-right text-gray-700">
                            {formatNumber(quote.rate, 2)}
                          </td>
                          <td className="px-4 py-4 text-right text-gray-700">
                            £{formatNumber(quote.fee, 2)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Link
                              href={`/go/provider/${quote.providerId}?from=${FROM_CURRENCY}&to=${TO_CURRENCY}&amount=${parseFloat(sendAmount) || 0}`}
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

            <p className="text-xs text-gray-500 mt-3">
              {`Rates last checked: ${rateFreshnessLabel}`}
            </p>

            <p className="text-xs text-gray-500 mt-2">
              Final rates may vary based on payment method, promotions, and provider fees.
            </p>

            <p className="text-sm text-gray-500 mt-4">
              Last updated: {formattedLastUpdated}
            </p>
          </>
        ) : (
          <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-4 text-sm text-blue-900">
            This corridor is informational only at the moment. Live comparisons and transfers will be available soon.
          </div>
        )}

        <section className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

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
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Which provider offers the best GBP to CAD rate?</h3>
              <p className="text-gray-700">The best rate varies daily based on market conditions. Our comparison page shows live rates from trusted providers updated regularly. Most users find Wise and Remitly offer competitive rates with low fees.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How much does it cost to send money GBP to Canada?</h3>
              <p className="text-gray-700">Fees depend on the provider and transfer method. Wise typically charges £1–3 for transfers, while Remitly charges 2–4% of the transfer amount. Check the comparison table above for current rates and fees.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How long does a GBP to CAD transfer take?</h3>
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
