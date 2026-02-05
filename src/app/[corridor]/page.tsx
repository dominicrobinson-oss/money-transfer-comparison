"use client";

import { useParams, useRouter } from "next/navigation";
import { corridors, getCorridorById } from "@/lib/corridors";
import { getProvidersByCurrency } from "@/lib/providers";
import { useEffect } from "react";
import Link from "next/link";

export default function DynamicCorridorPage() {
  const params = useParams();
  const router = useRouter();
  const corridorId = params.corridor as string;
  
  const corridor = getCorridorById(corridorId);
  const supportingProviders = corridor ? getProvidersByCurrency(corridor.toCurrency) : [];

  // Redirect to home if corridor doesn't exist
  useEffect(() => {
    if (!corridor) {
      router.push("/");
    }
  }, [corridor, router]);

  if (!corridor) {
    return null;
  }

  // If it's an active corridor, redirect to the specific implementation
  if (corridor.status === "active") {
    useEffect(() => {
      router.push(`/${corridor.id}`);
    }, []);
    return null;
  }

  // Show informational/coming-soon page
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {corridor.fromCurrency} → {corridor.toCurrency}
          </h1>
          {corridor.countryName && (
            <p className="text-xl text-gray-600">
              Send money to {corridor.countryName}
            </p>
          )}
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 md:p-12 text-center">
          <div className="mb-6">
            <svg
              className="w-20 h-20 mx-auto text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Full Comparison Coming Soon
          </h2>

          <div className="max-w-2xl mx-auto space-y-4 text-gray-600 mb-8">
            <p className="text-lg">
              We're working on adding comprehensive provider comparison for the{" "}
              <span className="font-semibold text-gray-900">
                {corridor.fromCurrency} to {corridor.toCurrency}
              </span>{" "}
              corridor.
            </p>
            <p>
              This will include real-time rates, fees, and transfer speeds from
              multiple trusted providers, just like our existing corridors.
            </p>
          </div>

          {/* Features that will be available */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">
              What to expect when this corridor launches:
            </h3>
            <ul className="text-left max-w-md mx-auto space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Live exchange rate comparisons</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Multiple payment method options</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Transparent fee breakdowns</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Transfer speed estimates</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Provider promotions and special offers</span>
              </li>
            </ul>
          </div>

          {/* Providers that support this currency */}
          {supportingProviders.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Providers that support {corridor.toCurrency}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                These providers already offer transfers to {corridor.toCurrency}. Full comparison coming soon.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {supportingProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className="bg-white rounded-md p-3 border border-green-200"
                  >
                    <div className="font-medium text-gray-900 mb-1">
                      {provider.name}
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>⚡ {provider.typicalSpeed}</div>
                      <div>
                        📤 {provider.payoutTypes.map(p => p.replace('-', ' ')).join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call to action */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              View Available Corridors
            </Link>
            <p className="text-sm text-gray-500">
              Check out our active corridors for full comparisons now
            </p>
          </div>
        </div>

        {/* Active corridors suggestion */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Available for Comparison Now
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {corridors
              .filter((c) => c.status === "active")
              .slice(0, 6)
              .map((c) => (
                <Link
                  key={c.id}
                  href={`/${c.id}`}
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition"
                >
                  <div className="font-semibold text-gray-900">
                    {c.fromCurrency} → {c.toCurrency}
                  </div>
                  {c.countryName && (
                    <div className="text-sm text-gray-600">{c.countryName}</div>
                  )}
                </Link>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
