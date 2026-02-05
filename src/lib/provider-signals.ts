import { Provider } from "@/types/core";

export interface ProviderSignal {
  providerId: string;
  signal: string;
  reason: string; // for hover tooltips
}

/**
 * Determine confidence signals for providers based on:
 * - Provider capabilities (speed, payout types)
 * - Telemetry data (click counts)
 */
export function getProviderSignals(
  providers: Provider[],
  telemetryStats: Record<string, { clicks: number; lastClickedAt: string | null }>
): Record<string, ProviderSignal> {
  const signals: Record<string, ProviderSignal> = {};

  // Analyze speed capabilities
  const speedMap: Record<string, number> = {};
  providers.forEach((p) => {
    const speedScore =
      p.typicalSpeed.includes("Minutes") ? 3 :
      p.typicalSpeed.includes("1-2 hours") ? 2 :
      p.typicalSpeed.includes("1-3 days") ? 1 :
      p.typicalSpeed.includes("1 day") ? 1 :
      0;
    speedMap[p.id] = speedScore;
  });

  // Find fastest provider
  const speedEntries = Object.entries(speedMap).sort(([, a], [, b]) => b - a);
  const fastestId = speedEntries.length > 0 ? speedEntries[0][0] : null;

  // Analyze payout variety
  const payoutVarietyMap: Record<string, number> = {};
  providers.forEach((p) => {
    payoutVarietyMap[p.id] = p.payoutTypes.length;
  });
  const payoutEntries = Object.entries(payoutVarietyMap).sort(([, a], [, b]) => b - a);
  const mostFlexibleId = payoutEntries.length > 0 ? payoutEntries[0][0] : null;

  // Analyze telemetry - who's most trusted/popular
  const clickCounts = providers.map((p) => ({
    id: p.id,
    clicks: telemetryStats[p.id]?.clicks || 0,
  }));
  const clickEntries = clickCounts.sort((a, b) => b.clicks - a.clicks);
  const mostPopularId = clickEntries.length > 0 && clickEntries[0].clicks > 0 ? clickEntries[0].id : null;

  // Assign signals to each provider
  providers.forEach((provider) => {
    let signal = "";
    let reason = "";

    if (provider.id === fastestId && provider.id !== mostFlexibleId) {
      signal = "Best for speed";
      reason = `Fastest option: ${provider.typicalSpeed}`;
    } else if (provider.id === mostFlexibleId && provider.id !== fastestId) {
      signal = "Best for flexibility";
      reason = `Multiple payout options: ${provider.payoutTypes.join(", ")}`;
    } else if (
      provider.id === mostPopularId &&
      clickEntries.filter((c) => c.clicks > 0).length > 1
    ) {
      signal = "Most popular";
      reason = `${telemetryStats[provider.id]?.clicks || 0} users chose this`;
    } else if (provider.payoutTypes.includes("cash") || provider.payoutTypes.includes("home-delivery")) {
      signal = "Best for cash";
      reason = "Receive cash in person";
    } else if (provider.payoutTypes.includes("mobile-wallet")) {
      signal = "Best for mobile";
      reason = "Direct mobile money transfer";
    } else {
      // No strong signal, but we can still provide one based on broader characteristics
      if (provider.supportedCurrencies.length > 15) {
        signal = "Global reach";
        reason = `Supports ${provider.supportedCurrencies.length} currencies`;
      } else {
        signal = "Reliable";
        reason = "Trusted transfer provider";
      }
    }

    signals[provider.id] = {
      providerId: provider.id,
      signal,
      reason,
    };
  });

  return signals;
}

/**
 * Get a single provider's signal
 */
export function getProviderSignal(
  provider: Provider,
  telemetryStats: Record<string, { clicks: number; lastClickedAt: string | null }>
): ProviderSignal {
  const signals = getProviderSignals([provider], telemetryStats);
  return signals[provider.id] || {
    providerId: provider.id,
    signal: "Reliable",
    reason: "Trusted transfer provider",
  };
}
