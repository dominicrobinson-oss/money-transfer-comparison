// Core type definitions for money transfer comparison app

export interface Provider {
  id: string;
  name: string;
  websiteUrl: string;
  supportsNGN: boolean;
}

export interface Quote {
  providerId: string;
  fromCurrency: "GBP";
  toCurrency: "NGN";
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
  toCurrency: "NGN";
  sendAmount: number;
  clickedAt: string; // ISO string
  userAgent: string;
  referrer: string | null;
}
