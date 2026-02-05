"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { corridors } from "@/lib/corridors";

const corridorLinks = [
  {
    from: "GBP",
    to: "NGN",
    country: "Nigeria",
    description: "Send money to Nigeria with competitive rates from trusted providers",
    href: "/gbp-to-ngn",
  },
  {
    from: "GBP",
    to: "GHS",
    country: "Ghana",
    description: "Send money to Ghana with the best exchange rates and lowest fees",
    href: "/gbp-to-ghs",
  },
  {
    from: "GBP",
    to: "ZAR",
    country: "South Africa",
    description: "Send money to South Africa with real-time rate comparisons",
    href: "/gbp-to-zar",
  },
  {
    from: "GBP",
    to: "USD",
    country: "United States",
    description: "Send money to USA with transparent pricing and fast transfers",
    href: "/gbp-to-usd",
  },
  {
    from: "GBP",
    to: "EUR",
    country: "Europe",
    description: "Send money to Europe with excellent rates and minimal fees",
    href: "/gbp-to-eur",
  },
  {
    from: "GBP",
    to: "CAD",
    country: "Canada",
    description: "Send money to Canada with competitive exchange rates",
    href: "/gbp-to-cad",
  },
];

// Currency metadata
const currencyInfo: Record<string, { name: string; flag: string }> = {
  NGN: { name: "Nigerian Naira", flag: "🇳🇬" },
  GHS: { name: "Ghanaian Cedi", flag: "🇬🇭" },
  ZAR: { name: "South African Rand", flag: "🇿🇦" },
  USD: { name: "US Dollar", flag: "🇺🇸" },
  EUR: { name: "Euro", flag: "🇪🇺" },
  CAD: { name: "Canadian Dollar", flag: "🇨🇦" },
  INR: { name: "Indian Rupee", flag: "🇮🇳" },
  PKR: { name: "Pakistani Rupee", flag: "🇵🇰" },
  KES: { name: "Kenyan Shilling", flag: "🇰🇪" },
  PHP: { name: "Philippine Peso", flag: "🇵🇭" },
  BDT: { name: "Bangladeshi Taka", flag: "🇧🇩" },
  JPY: { name: "Japanese Yen", flag: "🇯🇵" },
  AUD: { name: "Australian Dollar", flag: "🇦🇺" },
  NZD: { name: "New Zealand Dollar", flag: "🇳🇿" },
  CHF: { name: "Swiss Franc", flag: "🇨🇭" },
  SGD: { name: "Singapore Dollar", flag: "🇸🇬" },
  HKD: { name: "Hong Kong Dollar", flag: "🇭🇰" },
  MXN: { name: "Mexican Peso", flag: "🇲🇽" },
  BRL: { name: "Brazilian Real", flag: "🇧🇷" },
  TRY: { name: "Turkish Lira", flag: "🇹🇷" },
  THB: { name: "Thai Baht", flag: "🇹🇭" },
  EGP: { name: "Egyptian Pound", flag: "🇪🇬" },
  LKR: { name: "Sri Lankan Rupee", flag: "🇱🇰" },
  UGX: { name: "Ugandan Shilling", flag: "🇺🇬" },
  TZS: { name: "Tanzanian Shilling", flag: "🇹🇿" },
  RWF: { name: "Rwandan Franc", flag: "🇷🇼" },
  MAD: { name: "Moroccan Dirham", flag: "🇲🇦" },
  JMD: { name: "Jamaican Dollar", flag: "🇯🇲" },
  TTD: { name: "Trinidad & Tobago Dollar", flag: "🇹🇹" },
  XOF: { name: "West African CFA Franc", flag: "🌍" },
  XAF: { name: "Central African CFA Franc", flag: "🌍" },
};

export default function Home() {
  const router = useRouter();
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  
  // Include both active and informational corridors
  const availableCurrencies = corridors
    .filter((c) => c.status === "active" || c.status === "informational")
    .map((c) => c.toCurrency)
    .filter((value, index, self) => self.indexOf(value) === index); // unique

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    if (currency) {
      const corridor = corridors.find(
        (c) => c.toCurrency === currency && (c.status === "active" || c.status === "informational")
      );
      if (corridor) {
        router.push(`/${corridor.id}`);
      }
    }
  };
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Money Transfer Comparison
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6">
            Compare real-time exchange rates from trusted money transfer providers. Send money internationally with the best rates and lowest fees.
          </p>

          {/* Currency Selector */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <label
              htmlFor="currency-select"
              className="block text-sm font-medium text-gray-700 mb-3"
            >
              I want to send GBP to:
            </label>
            <select
              id="currency-select"
              value={selectedCurrency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="block w-full md:w-auto px-4 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md bg-white"
            >
              <option value="">Select currency...</option>
              {availableCurrencies.map((currency) => {
                const info = currencyInfo[currency];
                const corridor = corridors.find((c) => c.toCurrency === currency);
                const isActive = corridor?.status === "active";
                return (
                  <option key={currency} value={currency}>
                    {info?.flag} {currency} - {info?.name} {!isActive ? "(Coming Soon)" : ""}
                  </option>
                );
              })}
            </select>
            <p className="mt-3 text-sm text-gray-500">
              Select a currency to compare rates instantly
            </p>
          </div>
        </div>
      </section>

      {/* Corridors Grid */}
      <section className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Available Corridors
        </h2>
        <p className="text-gray-600 mb-8">
          Or browse all supported currency pairs below
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {corridorLinks.map((corridor) => (
            <Link
              key={corridor.href}
              href={corridor.href}
              className="group block bg-white rounded-lg shadow hover:shadow-lg transition border border-gray-200 hover:border-blue-500 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition">
                    {corridor.from} → {corridor.to}
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded">
                    {corridor.country}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  {corridor.description}
                </p>
                <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                  Compare Rates
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Information Section */}
      <section className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Why Use Our Comparison Tool?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Real-Time Rates
              </h3>
              <p className="text-gray-700">
                Get live exchange rates from multiple providers updated every 10 minutes. Compare rates before you send.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Transparent Fees
              </h3>
              <p className="text-gray-700">
                See the exact fee each provider charges. No hidden costs, no surprises. Calculate exactly how much you'll receive.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Trusted Providers
              </h3>
              <p className="text-gray-700">
                All providers listed are regulated by the Financial Conduct Authority (FCA). Fully verified and secure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          How It Works
        </h2>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white font-bold">
                1
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Select Your Corridor
              </h3>
              <p className="text-gray-700 mt-2">
                Choose where you want to send money. We support 6 major international corridors.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white font-bold">
                2
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Enter Amount
              </h3>
              <p className="text-gray-700 mt-2">
                Enter how much you want to send in GBP. Rates update instantly.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white font-bold">
                3
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Compare Providers
              </h3>
              <p className="text-gray-700 mt-2">
                See rates, fees, and how much the recipient gets from all providers side-by-side.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white font-bold">
                4
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Send Money
              </h3>
              <p className="text-gray-700 mt-2">
                Click the provider you prefer. We'll redirect you to their website to complete the transfer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white mt-12">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Start Comparing Rates Today
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Choose a corridor above to find the best money transfer rates for your needs.
          </p>
          <Link
            href="/gbp-to-ngn"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition"
          >
            Compare Rates Now
          </Link>
        </div>
      </section>

        {/* Transparency Section */}
        <section className="bg-white border-t mt-12">
          <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              How We Work
            </h2>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-amber-900 mb-3">Transparency & Disclosure</h3>
              <p className="text-amber-800 mb-4">
                This site is designed to help you compare money transfer rates between providers. Here's how we operate:
              </p>
              <ul className="space-y-3 text-amber-800">
                <li className="flex gap-2">
                  <span className="font-semibold">•</span>
                  <span><strong>No Payment Processing:</strong> We do not process payments or hold your money. We only compare rates and redirect you to providers' websites.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">•</span>
                  <span><strong>Referral Fees:</strong> We may earn referral fees from providers when you click through and complete a transfer. This does not increase the cost to you—you pay the same rate whether you use our site or visit the provider directly.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">•</span>
                  <span><strong>Independent Comparisons:</strong> All providers listed are FCA-regulated. We do not favor any provider based on fees they pay us.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">•</span>
                  <span><strong>Not Financial Advice:</strong> This tool is for informational purposes only. We do not provide financial advice. Please research providers and make your own decision.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 border-t">
          <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 text-sm">
            <div className="mb-6 pb-6 border-b border-gray-700">
              <p className="text-gray-400">
                <strong>Important Disclaimer:</strong> This comparison tool is provided for informational purposes only. Exchange rates and fees shown are indicative and may change. The actual amount you receive is determined by the provider at the time of transfer. Always verify terms with your chosen provider before sending money. This is not financial advice.
              </p>
            </div>
            <p className="text-gray-500">
              © {new Date().getFullYear()} Money Transfer Comparison. All providers listed are regulated by the Financial Conduct Authority (FCA) in the United Kingdom.
            </p>
          </div>
        </footer>
    </main>
  );
}
