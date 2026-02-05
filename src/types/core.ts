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

export interface ProviderRating {
  providerId: string;
  trustpilotScore: number | null;
  trustpilotReviews: number | null;
  googleRating: number | null;
  googleReviews: number | null;
  lastUpdated: string; // ISO string
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
