import {
  getTopCorridorsByViews,
  getTopProvidersByClicks,
  getCorridorClickThroughRates,
  getTopTransferMethods,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  // Fetch all analytics data in parallel
  const [corridorViews, providerClicks, corridorCTRs, transferMethods] = await Promise.all([
    getTopCorridorsByViews(),
    getTopProvidersByClicks(),
    getCorridorClickThroughRates(),
    getTopTransferMethods(),
  ]);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm text-gray-600 mt-2">
            Internal analytics • Admin-only (no auth yet)
          </p>
        </div>

        <div className="grid gap-6">
          {/* Top Corridors by Views */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Top Corridors by Views
            </h2>
            {corridorViews.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Corridor
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {corridorViews.map((row, index) => (
                      <tr key={row.corridor} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.corridor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                          {row.views.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No corridor views recorded yet.</p>
            )}
          </section>

          {/* Top Providers by Clicks */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Top Providers by Clicks
            </h2>
            {providerClicks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Provider
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clicks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {providerClicks.map((row, index) => (
                      <tr key={row.providerId} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.providerId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                          {row.clicks.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No provider clicks recorded yet.</p>
            )}
          </section>

          {/* Click-Through Rate per Corridor */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Click-Through Rate by Corridor
            </h2>
            {corridorCTRs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Corridor
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clicks
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CTR
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {corridorCTRs.map((row, index) => (
                      <tr key={row.corridor} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.corridor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                          {row.views.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                          {row.clicks.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                          {(row.ctr * 100).toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No corridor data available yet.</p>
            )}
          </section>

          {/* Most Selected Transfer Methods */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Most Selected Transfer Methods
            </h2>
            {transferMethods.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Selections
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transferMethods.map((row, index) => (
                      <tr key={row.method} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                          {row.method}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                          {row.selections.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                          {row.percentage.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No transfer method selections recorded yet.</p>
            )}
          </section>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> This is an internal analytics dashboard. Authentication and
            access control will be added in a future update. Data shown is aggregated and does not
            contain personally identifiable information.
          </p>
        </div>
      </div>
    </main>
  );
}
