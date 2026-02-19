/**
 * Privacy-safe usage telemetry
 * Tracks anonymous user interactions without collecting PII
 */

import type { TelemetryEventType, TelemetryEvent } from "@/types/core";

export type AmountBucket = "<100" | "100-500" | "500-1000" | "1000+";

/**
 * Bucket amount for privacy (no exact amounts logged)
 */
export function bucketAmount(amount: number): AmountBucket {
  if (amount < 100) return "<100";
  if (amount < 500) return "100-500";
  if (amount < 1000) return "500-1000";
  return "1000+";
}

/**
 * Track a telemetry event
 * Fire-and-forget, non-blocking, anonymous
 */
export function trackEvent(
  eventType: TelemetryEventType,
  data: TelemetryEvent["data"] = {}
): void {
  // Skip tracking in development to avoid noise
  if (process.env.NODE_ENV === "development") {
    return;
  }

  const event: TelemetryEvent = {
    eventType,
    timestamp: new Date().toISOString(),
    data,
  };

  // Fire-and-forget: use sendBeacon if available, fallback to fetch
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(event)], {
      type: "application/json",
    });
    navigator.sendBeacon("/api/telemetry", blob);
  } else if (typeof fetch !== "undefined") {
    // Non-blocking fetch, ignore response
    fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      keepalive: true,
    }).catch(() => {
      // Silently fail - telemetry should never break the app
    });
  }
}

/**
 * Client-side helper: Track corridor view
 */
export function trackCorridorView(fromCurrency: string, toCurrency: string): void {
  trackEvent("corridor_viewed", {
    corridor: `${fromCurrency}-${toCurrency}`,
    fromCurrency,
    toCurrency,
  });
}

/**
 * Client-side helper: Track amount change (bucketed)
 */
export function trackAmountChange(amount: number): void {
  trackEvent("amount_changed", {
    amountBucket: bucketAmount(amount),
  });
}

/**
 * Client-side helper: Track currency selection
 */
export function trackCurrencySelect(fromCurrency: string, toCurrency: string): void {
  trackEvent("currency_selected", {
    corridor: `${fromCurrency}-${toCurrency}`,
    fromCurrency,
    toCurrency,
  });
}

/**
 * Server-side helper: Track provider click
 */
export function trackProviderClick(
  providerId: string,
  fromCurrency: string,
  toCurrency: string
): void {
  trackEvent("provider_clicked", {
    providerId,
    corridor: `${fromCurrency}-${toCurrency}`,
    fromCurrency,
    toCurrency,
  });
}
