// Strict union of all telemetry event types used in the app
export type TelemetryEventType =
  | "corridor_view"
  | "provider_click"
  | "cta_click"
  | "amount_input"
  | "currency_select"
  | "sort_change"
  | "filter_change"
  | "tab_change"
  | "install_pwa"
  | "share"
  | "copy"
  | "faq_toggle"
  | "rate_alert_create"
  | "rate_alert_delete"
  | "rate_alert_trigger"
  | "feedback_submit"
  | "error"
  | "impression"
  | "top_provider_impression"
  | "top_ranked_provider_click"
  | "signal_click"
  | "signal_impression"
  | "signal_conversion"
  | "device_type_detected"
  | "page_load"
  | "page_unload"
  | "api_error"
  | "api_success"
  | "api_request"
  | "api_response"
  | "api_latency"
  | "api_timeout"
  | "api_retry"
  | "api_rate_limit"
  | "api_cache_hit"
  | "api_cache_miss"
  | "api_cache_stale"
  | "api_cache_refresh"
  | "api_cache_clear"
  | "api_cache_error"
  | "api_cache_success"
  | "api_cache_request"
  | "api_cache_response"
  | "api_cache_latency"
  | "api_cache_timeout"
  | "api_cache_retry"
  | "api_cache_rate_limit"
  | "api_cache_stale_refresh"
  | "api_cache_stale_clear"
  | "api_cache_stale_error"
  | "api_cache_stale_success"
  | "api_cache_stale_request"
  | "api_cache_stale_response"
  | "api_cache_stale_latency"
  | "api_cache_stale_timeout"
  | "api_cache_stale_retry"
  | "api_cache_stale_rate_limit"
  | "scroll_depth"
  | "top_provider_impression"
  | "corridor_viewed"
  | "amount_changed"
  | "currency_selected"
  | "provider_clicked";
// Core type definitions for money transfer comparison app

export type TransferMethod = "bank" | "card" | "cash" | "wallet";

export interface MethodProfile {
  name: string;
  description: string;
  rateMultiplier: number; // 1.0 = no change, 0.99 = 1% better, 1.02 = 2% worse
  feeAdjustment: number; // absolute adjustment in GBP
}

export const METHOD_PROFILES: Record<TransferMethod, MethodProfile> = {
  bank: {
    name: "Bank transfer",
    description: "Direct bank transfer",
    rateMultiplier: 1.0,
    feeAdjustment: 0,
  },
  card: {
    name: "Debit card",
    description: "Debit card payment",
    rateMultiplier: 0.99,
    feeAdjustment: 0.5, // +£0.50
  },
  cash: {
    name: "Cash pickup",
    description: "Receive cash in person",
    rateMultiplier: 0.98,
    feeAdjustment: 1.0, // +£1.00
  },
  wallet: {
    name: "Mobile wallet",
    description: "Send via mobile money",
    rateMultiplier: 1.01,
    feeAdjustment: 0, // slightly better rate, no extra fee
  },
};

export type PayoutType = "bank" | "cash" | "mobile-wallet" | "home-delivery";

export interface Provider {
  id: string;
  name: string;
  websiteUrl: string;
  affiliateUrl?: string;
  redirectStrategy: "homepage" | "corridor" | "affiliate-only";
  supportsNGN: boolean; // deprecated, use supportedCurrencies
  supportedMethods: TransferMethod[];
  supportedCurrencies: string[]; // ISO 4217 codes
  payoutTypes: PayoutType[];
  typicalSpeed: string; // e.g., "Minutes", "1-2 hours", "1-3 days"
}

export interface Quote {
  providerId: string;
  fromCurrency: "GBP";
  toCurrency: "NGN" | "GHS" | "ZAR" | "USD" | "EUR" | "CAD";
  sendAmount: number;
  rate: number;
  fee: number;
  receiveAmount: number;
  fetchedAt: string; // ISO string
  source?: "live" | "mock";
}

// TelemetryEvent interface with flexible data property
export interface TelemetryEvent {
  eventType: TelemetryEventType;
  timestamp: string;
  data: {
    corridor?: string;
    amountBucket?: string;
    fromCurrency?: string;
    toCurrency?: string;
    providerId?: string;
    bucket?: string;
    rankingPosition?: number;
    [key: string]: unknown;
  };
}

export interface ProviderClick {
  providerId: string;
  fromCurrency: "GBP";
  toCurrency: "NGN" | "GHS" | "ZAR" | "USD" | "EUR" | "CAD";
  sendAmount: number;
  clickedAt: string; // ISO string
  userAgent: string;
  referrer: string | null;
}

export type PromoType = "fee-free" | "bonus" | "boosted-rate";

export interface Promotion {
  id: string;
  providerId: string;
  corridor?: string; // e.g., "GBP-NGN", undefined = applies to all
  transferMethod?: TransferMethod; // undefined = applies to all methods
  promoType: PromoType;
  eligibility: string; // e.g., "New customers"
  expiryDate: string; // ISO date string
  disclaimerText: string;
  badgeLabel?: string; // optional custom badge text, defaults to "Promo"
}
