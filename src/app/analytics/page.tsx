import {
  getTopCorridorsByViews,
  getTopProvidersByClicks,
  getCorridorClickThroughRates,
  getTopTransferMethods,
  getDailyViewCounts,
  getDailyClickCounts,
  getDailyConversionRates,
  getTopCorridors7d,
  getTopProviders7d,
  getConversionRateBySignal,
  getClicksByRankingPosition,
  getClicksByDeviceType,
  getTopRankedProviderCaptureRates,
  getRankingDropoffCurve,
  getSignalPerformance,
  getDeviceCTRBreakdown,
  getScrollDepthDistribution,
  getTopProviderImpressionConversion,
} from "@/lib/db";
import { corridors } from "@/lib/corridors";
import { Metadata } from "next";


export const dynamic = "force-dynamic";

// Prevent search engine indexing of analytics dashboard
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function AnalyticsPage() {
  // Fetch all analytics data in parallel
  const [corridorViews, providerClicks, corridorCTRs, transferMethods, dailyViews, dailyClicks, dailyConversion, topCorridors7d, topProviders7d, signalConversion, clicksByRank, clicksByDevice, topRankedCapture, rankingDropoff, signalPerformance, deviceCTRBreakdown, scrollDepth, impressionConversion] = await Promise.all([
    getTopCorridorsByViews(),
    getTopProvidersByClicks(),
    getCorridorClickThroughRates(),
    getTopTransferMethods(),
    getDailyViewCounts(),
    getDailyClickCounts(),
    getDailyConversionRates(),
    getTopCorridors7d(),
    getTopProviders7d(),
    getConversionRateBySignal(),
    getClicksByRankingPosition(),
    getClicksByDeviceType(),
    getTopRankedProviderCaptureRates(),
    getRankingDropoffCurve(),
    getSignalPerformance(),
    getDeviceCTRBreakdown(),
    getScrollDepthDistribution("GBP-NGN"),
    getTopProviderImpressionConversion("GBP-NGN"),
  ]);
  
    // Enrich corridor CTR data with status from corridors registry
    const enrichedCorridorCTRs = corridorCTRs.map((ctr) => {
      // Assume ctr.corridor is a string like "gbp-ngn"
      const [fromCurrency, toCurrency] = ctr.corridor.split("-");
      const corridor = corridors.find(
        (c) => c.fromCurrency === fromCurrency && c.toCurrency === toCurrency
      );
      return {
        ...ctr,
        // No status property in new corridor structure
      };
    });

    return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Scroll Depth Distribution */}
        <section className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Scroll Depth Distribution (GBP-NGN)</h2>
          {scrollDepth.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bucket</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% of Views</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scrollDepth.map((row, idx) => (
                    <tr key={row.bucket || idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.bucket}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{row.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{row.percent.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No scroll depth data yet.</p>
          )}
        </section>

        {/* Impression → Click Conversion */}
        <section className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Impression → Click Conversion (Rank #1, GBP-NGN)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{impressionConversion.impressions}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{impressionConversion.clicks}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{impressionConversion.conversionRate.toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* A) Ranking Drop-Off Curve */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ranking Drop-Off Curve</h2>
          {rankingDropoff.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ranking Position</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rankingDropoff.map((row, index) => (
                    <tr key={row.rankingPosition || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.rankingPosition}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{row.clicks}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{row.percent.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No ranking drop-off data yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
