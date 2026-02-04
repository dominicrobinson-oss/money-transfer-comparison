// Type definitions for money transfer providers and comparison

export interface TransferProvider {
  id: string;
  name: string;
  logo?: string;
  url: string;
  exchangeRate: number; // NGN per 1 GBP
  fee: number; // in GBP
  transferSpeed: string; // e.g., "Instant", "1-2 hours", "1-3 days"
  minAmount: number; // minimum transfer in GBP
  maxAmount: number; // maximum transfer in GBP
}

export interface TransferComparison {
  sendAmount: number; // Amount in GBP
  receiveAmount: number; // Amount in NGN
  provider: TransferProvider;
  totalCost: number; // fee + exchange rate markup
}

export interface ComparisonRequest {
  amount: number; // in GBP
  fromCurrency: "GBP";
  toCurrency: "NGN";
}

export interface ComparisonResponse {
  comparisons: TransferComparison[];
  bestRate: TransferComparison;
  fastestTransfer: TransferComparison;
  lowestFee: TransferComparison;
  timestamp: string;
}
