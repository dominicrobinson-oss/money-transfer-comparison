
"use client";


import React, { useEffect, useState, useRef, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Quote, TransferMethod, METHOD_PROFILES } from "@/types/core";
import { calculateQuote } from "@/lib/quote-engine";
import { corridors, getCorridorByPair } from "@/lib/corridors";
import { rankQuotes, RankedQuote } from "@/lib/quotes/rankQuotes";
import { applyMethodAdjustment } from "@/lib/quotes/applyMethodAdjustment";
import { formatNumber, formatNumberLocale } from "@/lib/utils/format";
import { providers } from "@/lib/providers";
import { transferProviders } from "@/lib/data/providers";
import { trackCorridorView, trackAmountChange, trackCurrencySelect, trackEvent } from "@/lib/telemetry";
import { getApplicablePromos } from "@/lib/promotions";
import { getProviderSignals, ProviderSignal } from "@/lib/provider-signals";


const FROM_CURRENCY = "GBP" as const;
const TO_CURRENCY = "NGN" as const;

const LIVE_FETCH_TIMEOUT_MS = 2000;
const DEFAULT_SEND_AMOUNT = 100;
// Static timestamp for mock quotes to ensure deterministic server rendering
const MOCK_TIMESTAMP = "2025-02-04T12:00:00Z";

// Mock quotes
const MOCK_QUOTES = {
  wise: {
    providerId: "wise",
    fromCurrency: "GBP" as const,
    toCurrency: "NGN" as const,
    sendAmount: DEFAULT_SEND_AMOUNT,
    rate: 2050.5,
    fee: 3.5,
    receiveAmount: (DEFAULT_SEND_AMOUNT - 3.5) * 2050.5,
    fetchedAt: MOCK_TIMESTAMP,
    source: "mock" as const,
  },
  remitly: {
    providerId: "remitly",
    fromCurrency: "GBP" as const,
    toCurrency: "NGN" as const,
    sendAmount: DEFAULT_SEND_AMOUNT,
    rate: 2040.75,
    fee: 2.99,
    receiveAmount: (DEFAULT_SEND_AMOUNT - 2.99) * 2040.75,
    fetchedAt: MOCK_TIMESTAMP,
    source: "mock" as const,
  },
  worldremit: {
    providerId: "worldremit",
    fromCurrency: "GBP" as const,
    toCurrency: "NGN" as const,
    sendAmount: DEFAULT_SEND_AMOUNT,
    rate: 2035.25,
    fee: 3.99,
    receiveAmount: (DEFAULT_SEND_AMOUNT - 3.99) * 2035.25,
    fetchedAt: MOCK_TIMESTAMP,
    source: "mock" as const,
  },
  sendwave: {
    providerId: "sendwave",
    fromCurrency: "GBP" as const,
    toCurrency: "NGN" as const,
    sendAmount: DEFAULT_SEND_AMOUNT,
    rate: 2055.0,
    fee: 0,
    receiveAmount: DEFAULT_SEND_AMOUNT * 2055.0,
    fetchedAt: MOCK_TIMESTAMP,
    source: "mock" as const,
  },
  taptapsend: {
    providerId: "taptapsend",
    fromCurrency: "GBP" as const,
    toCurrency: "NGN" as const,
    sendAmount: DEFAULT_SEND_AMOUNT,
    rate: 2045.0,
    fee: 1.99,
    receiveAmount: (DEFAULT_SEND_AMOUNT - 1.99) * 2045.0,
    fetchedAt: MOCK_TIMESTAMP,
    source: "mock" as const,
  },
};

export default function GbpToNgnPage() {
  // All hooks at the top
  const router = useRouter();
  const [sendAmount, setSendAmount] = useState<string>(String(DEFAULT_SEND_AMOUNT));
  const [selectedCurrency, setSelectedCurrency] = useState<string>(TO_CURRENCY);
  const [transferMethod, setTransferMethod] = useState<TransferMethod>("bank");
  const [quotes, setQuotes] = useState<Quote[]>(Object.values(MOCK_QUOTES));
  const [loadingProviders, setLoadingProviders] = useState<Set<string>>(new Set(["wise", "remitly"]));
  const [hasLiveQuotes, setHasLiveQuotes] = useState(false);
  const [formattedLastUpdated, setFormattedLastUpdated] = useState<string>("—");
  const [rateFreshnessLabel, setRateFreshnessLabel] = useState<string>("—");
  const [expandedPromo, setExpandedPromo] = useState<string | null>(null);
  const [providerSignals, setProviderSignals] = useState<Record<string, ProviderSignal>>({});
  const amountChangeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Derived variables after hooks
  const ranked = rankQuotes(quotes);
  const topQuote = ranked[0];
  const topProvider = providers.find((p) => p.id === topQuote?.providerId);

  // --- Scroll Depth Tracking ---
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const buckets = [0.25, 0.5, 0.75, 1];
    const fired: Record<string, boolean> = {};
    let ticking = false;
    function getDeviceType() {
      return window.matchMedia && window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
    }
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (docHeight <= 0) return;
          const percent = Math.min(scrollTop / docHeight, 1);
          for (let i = 0; i < buckets.length; i++) {
            const lower = i === 0 ? 0 : buckets[i - 1];
            const upper = buckets[i];
            if (percent >= lower && percent < upper && !fired[`${lower}-${upper}`]) {
              fired[`${lower}-${upper}`] = true;
              const bucketLabel =
                lower === 0
                  ? `0-25`
                  : lower === 0.25
                  ? `25-50`
                  : lower === 0.5
                  ? `50-75`
                  : `75-100`;
              trackEvent("scroll_depth", {
                corridor: "GBP-NGN",
                bucket: bucketLabel,
                deviceType: getDeviceType(),
              });
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- Top Provider Impression Tracking ---
  const impressionFired = React.useRef(false);
  React.useEffect(() => {
    if (
      !impressionFired.current &&
      topProvider &&
      topQuote &&
      ranked.length > 0
    ) {
      trackEvent("top_provider_impression", {
        providerId: topProvider.id,
        rankingPosition: 1,
        corridor: "GBP-NGN",
      });
      impressionFired.current = true;
    }
  }, [topProvider, topQuote, ranked]);

  // useCallback handlers after derived variables
  const handleAffiliateClick = useCallback(
    async (
      providerId: string,
      amount: number,
      event: React.MouseEvent<HTMLButtonElement>,
      rankingPosition: number,
      signalShown: string | undefined
    ) => {
      event.preventDefault();
      const url = `/go/provider/${providerId}?from=GBP&to=NGN&amount=${amount}`;
      let didRedirect = false;
      const timer = setTimeout(() => {
        if (!didRedirect) {
          didRedirect = true;
          window.location.href = url;
        }
      }, 150);
      try {
        const isMobile = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 767px)").matches;
        await fetch("/api/provider-clicks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            providerId,
            fromCurrency: FROM_CURRENCY,
            toCurrency: TO_CURRENCY,
            amount,
            corridor: `${FROM_CURRENCY}-${TO_CURRENCY}`,
            rankingPosition,
            signalShown,
            deviceType: isMobile ? "mobile" : "desktop",
            timestamp: Date.now(),
          }),
          keepalive: true,
        });
      } catch {}
      if (!didRedirect) {
        didRedirect = true;
        clearTimeout(timer);
        window.location.href = url;
      }
    },
    []
  );
  // JSON-LD structured data for SEO
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Which provider offers the best GBP to NGN rate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The best rate varies daily based on market conditions. Our comparison page shows live rates from trusted providers updated regularly. Most users find Wise and Remitly offer competitive rates with low fees."
        }
      },
      {
        "@type": "Question",
        "name": "How much does it cost to send money GBP to Nigeria?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Fees depend on the provider and transfer method. Wise typically charges £1–3 for transfers, while Remitly charges 2–4% of the transfer amount. Check the comparison table above for current rates and fees."
        }
      },
      {
        "@type": "Question",
        "name": "How long does a GBP to NGN transfer take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most providers deliver within 1–2 business days. Wise is known for faster transfers, often completing within 24 hours. Transfer speed may vary based on bank processing times and recipient bank."
        }
      },
      {
        "@type": "Question",
        "name": "Are these providers safe and regulated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. All providers listed are regulated by the Financial Conduct Authority (FCA) in the UK and operate under strict compliance standards. Always verify provider credentials before sending money."
        }
      }
    ]
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Money Transfer Comparison",
    "url": "https://money-transfer-comparison.com/",
    "logo": "https://money-transfer-comparison.com/icons/icon-512.png",
    "sameAs": [
      "https://twitter.com/moneytransferco",
      "https://www.linkedin.com/company/money-transfer-comparison/"
    ]
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Money Transfer Comparison",
    "url": "https://money-transfer-comparison.com/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://money-transfer-comparison.com/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };


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

  /**
   * Recalculate quotes based on new send amount
   * Formula: receiveAmount = (sendAmount - fee) * rate
   */
  const getRecalculatedQuotes = (amountStr: string): Quote[] => {
    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0) return quotes;
    return quotes.map((quote) => {
      // Use the quote-engine for calculation
      const calculated = calculateQuote({
        provider: transferProviders.find((p) => p.id === quote.providerId)!,
        corridor: corridor!,
        method: transferMethod,
        amount,
      });
      return {
        ...quote,
        ...calculated,
        fromCurrency: "GBP" as const,
        toCurrency: quote.toCurrency,
      };
    });
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

  // Fetch provider signals from telemetry data
  useEffect(() => {
    const fetchProviderSignals = async () => {
      try {
        const res = await fetch("/api/provider-stats");
        if (res.ok) {
          const stats = await res.json();
          const signals = getProviderSignals(providers, stats);
          setProviderSignals(signals);
        }
      } catch (error) {
        console.error("Failed to fetch provider signals:", error);
      }
    };
    fetchProviderSignals();
  }, []);

  useEffect(() => {
    // Fetch live quotes from API in background without blocking
    const fetchLiveQuotes = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), LIVE_FETCH_TIMEOUT_MS);
        
        const res = await fetch("/api/quotes/live?from=GBP&to=NGN", {
          signal: controller.signal,
        });
        clearTimeout(timeout);
        
        if (res.ok) {
          const response = await res.json();
          if (response.status === "success" && response.data && Array.isArray(response.data)) {
            // API returns array of quotes, merge with mocks
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

  // Format timestamp client-side only to avoid hydration mismatch
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
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          key="faq-jsonld"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
          key="org-jsonld"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          key="website-jsonld"
        />
      </Head>
      <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Best GBP to NGN rate today
        </h1>
        
        {/* Amount Input */}
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

        {/* Transfer Method Selector */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <label htmlFor="method-select" className="block text-sm font-medium text-gray-700 mb-2">
            Payment method
          </label>
          <select
            id="method-select"
            value={transferMethod}
            onChange={(e) => setTransferMethod(e.target.value as TransferMethod)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          >
            {Object.entries(METHOD_PROFILES).map(([method, profile]) => (
              <option key={method} value={method}>
                {profile.name}
              </option>
            ))}
          </select>
        </div>

        {isActive ? (
          <>
            {loadingProviders.size > 0 && (
              <div className="mb-4 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded">
                <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                Fetching live rates…
              </div>
            )}


            {/* Comparison Summary Banner */}
            {ranked.length > 0 && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:gap-8 gap-2">
                <span className="font-semibold text-blue-900 text-sm">Comparison summary:</span>
                <span className="text-blue-800 text-sm">
                  <strong>Best rate:</strong> {(() => {
                    const best = [...ranked].sort((a, b) => b.receiveAmount - a.receiveAmount)[0];
                    const p = providers.find((pr) => pr.id === best?.providerId);
                    return p ? p.name : best?.providerId;
                  })()} (₦{formatNumberLocale(Math.max(...ranked.map(q => q.receiveAmount)), 2)})
                </span>
                <span className="text-blue-800 text-sm">
                  <strong>Fastest:</strong> {(() => {
                    // Find provider with highest speed score from provider-signals
                    const fastest = Object.entries(providerSignals).find(([, s]) => s.signal === "Best for speed");
                    if (fastest) {
                      const p = providers.find((pr) => pr.id === fastest[0]);
                      return p ? p.name : fastest[0];
                    }
                    return "-";
                  })()}
                </span>
                <span className="text-blue-800 text-sm">
                  <strong>Most flexible:</strong> {(() => {
                    const flexible = Object.entries(providerSignals).find(([, s]) => s.signal === "Best for flexibility");
                    if (flexible) {
                      const p = providers.find((pr) => pr.id === flexible[0]);
                      return p ? p.name : flexible[0];
                    }
                    return "-";
                  })()}
                </span>
              </div>
            )}
            <p className="text-xs text-gray-500 mb-4">All providers are compared using the same £{formatNumber(parseFloat(sendAmount))} amount via {METHOD_PROFILES[transferMethod].name.toLowerCase()}—rankings show relative value, not exact checkout pricing.</p>

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
                      // Skip if provider is not registered or doesn't support selected method
                      if (!provider) return null;
                      if (!provider.supportedMethods.includes(transferMethod)) return null;
                      // Apply method adjustments to quote
                      const adjustedQuote = applyMethodAdjustment(quote, transferMethod);
                      // Use semantic key when data is complete, fallback to index
                      const itemKey = quote.providerId && quote.fromCurrency && quote.toCurrency
                        ? `${quote.providerId}-${quote.fromCurrency}-${quote.toCurrency}`
                        : index;

                      // Only for the top ranked provider, show the transparency box
                      const isTop = index === 0;
                      return (
                        <>
                          <tr
                            key={itemKey}
                            className={`hover:bg-gray-50 transition ${isLoading ? "opacity-75" : ""}`}
                          >
                            <td className="px-4 py-4">
                              <div className="font-medium text-gray-900 flex items-center gap-2">
                                {provider?.name || quote.providerId}
                                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                                  Estimated
                                </span>
                                <span className="inline-flex items-center" title="Rates differ because providers use different exchange rates, fee structures, and payment methods. These are estimates—final rates shown at checkout may vary.">
                                  <svg className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                </span>
                                {(() => {
                                  const promos = getApplicablePromos(
                                    quote.providerId,
                                    `${FROM_CURRENCY}-${TO_CURRENCY}`,
                                    transferMethod
                                  );
                                  if (promos.length > 0) {
                                    return (
                                      <button
                                        onClick={() =>
                                          setExpandedPromo(
                                            expandedPromo === quote.providerId
                                              ? null
                                              : quote.providerId
                                          )
                                        }
                                        className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded font-medium hover:bg-purple-200 transition cursor-pointer"
                                        title={promos[0].disclaimerText}
                                      >
                                        {promos[0].badgeLabel || "Promo"}
                                      </button>
                                    );
                                  }
                                  return null;
                                })()}
                                {quote.bestRateToday && (
                                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                    Best Rate
                                  </span>
                                )}
                                {isLoading && (
                                  <span className="inline-block w-1 h-1 bg-gray-400 rounded-full animate-pulse"></span>
                                )}
                              </div>
                              {expandedPromo === quote.providerId && (() => {
                                const promos = getApplicablePromos(
                                  quote.providerId,
                                  `${FROM_CURRENCY}-${TO_CURRENCY}`,
                                  transferMethod
                                );
                                return (
                                  <div className="mt-2 text-xs bg-purple-50 border border-purple-200 rounded p-2">
                                    {promos.map((promo) => (
                                      <div key={promo.id}>
                                        <div className="font-medium text-purple-900">
                                          {promo.badgeLabel || "Promotion"}
                                        </div>
                                        <div className="text-purple-800 mt-1">
                                          {promo.disclaimerText}
                                        </div>
                                        <div className="text-purple-700 text-xs mt-1">
                                          Eligibility: {promo.eligibility}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                              {provider && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded" title="Typical transfer speed">
                                    ⚡ {provider.typicalSpeed}
                                  </span>
                                  {provider.payoutTypes.includes("mobile-wallet") && (
                                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded" title="Mobile wallet payout available">
                                      📱 Wallet
                                    </span>
                                  )}
                                  {provider.payoutTypes.includes("cash") && (
                                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded" title="Cash pickup available">
                                      💵 Cash
                                    </span>
                                  )}
                                  {providerSignals[quote.providerId] && (
                                    <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded" title={providerSignals[quote.providerId].reason}>
                                      ★ {providerSignals[quote.providerId].signal}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 text-right font-semibold text-gray-900">
                              ₦{formatNumberLocale(adjustedQuote.receiveAmount, 2)}
                            </td>
                            <td className="px-4 py-4 text-right text-gray-700">
                              {formatNumber(adjustedQuote.rate, 2)}
                            </td>
                            <td className="px-4 py-4 text-right text-gray-700">
                              £{formatNumber(adjustedQuote.fee, 2)}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <button
                                type="button"
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition disabled:opacity-50"
                                onClick={(e) => handleAffiliateClick(
                                  quote.providerId,
                                  parseFloat(sendAmount) || 0,
                                  e,
                                  index + 1,
                                  providerSignals[quote.providerId]?.signal
                                )}
                              >
                                Send with {provider?.name}
                              </button>
                            </td>
                          </tr>
                          {isTop && providerSignals[quote.providerId] && (
                            <tr>
                              <td colSpan={5} className="bg-blue-50 border-b border-blue-100 px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-blue-700 font-semibold text-sm">Why this is ranked #1:</span>
                                  <span className="text-blue-900 font-medium text-sm">{providerSignals[quote.providerId].signal}</span>
                                  <span className="text-gray-600 text-xs" title={providerSignals[quote.providerId].reason}>
                                    ({providerSignals[quote.providerId].reason})
                                  </span>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
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
        
        {/* FAQ Section */}
        <section className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Which provider offers the best GBP to NGN rate?</h3>
              <p className="text-gray-700">The best rate varies daily based on market conditions. Our comparison page shows live rates from trusted providers updated regularly. Most users find Wise and Remitly offer competitive rates with low fees.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How much does it cost to send money GBP to Nigeria?</h3>
              <p className="text-gray-700">Fees depend on the provider and transfer method. Wise typically charges £1–3 for transfers, while Remitly charges 2–4% of the transfer amount. Check the comparison table above for current rates and fees.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How long does a GBP to NGN transfer take?</h3>
              <p className="text-gray-700">Most providers deliver within 1–2 business days. Wise is known for faster transfers, often completing within 24 hours. Transfer speed may vary based on bank processing times and recipient bank.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Are these providers safe and regulated?</h3>
              <p className="text-gray-700">Yes. All providers listed are regulated by the Financial Conduct Authority (FCA) in the UK and operate under strict compliance standards. Always verify provider credentials before sending money.</p>
            </div>
          </div>
        </section>

      </div>
      {/* Sticky Mobile CTA */}
      {topQuote && topProvider && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 shadow-lg flex items-center justify-between px-4 py-3"
          role="region"
          aria-label="Top provider quick action"
        >
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-xs text-gray-500">Top provider</span>
            <span className="font-semibold text-gray-900 truncate">{topProvider.name}</span>
            <span className="text-xs text-gray-700 truncate">You receive ₦{formatNumberLocale(topQuote.receiveAmount, 2)}</span>
          </div>
          <button
            type="button"
            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={(e) => handleAffiliateClick(
              topQuote.providerId,
              parseFloat(sendAmount) || 0,
              e,
              1,
              providerSignals[topQuote.providerId]?.signal
            )}
            aria-label={`Send with ${topProvider.name}`}
          >
            Send with {topProvider.name}
          </button>
        </div>
      )}
    </main>
  </>
  );
}
