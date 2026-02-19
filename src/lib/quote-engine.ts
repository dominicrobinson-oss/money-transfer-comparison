import { TransferProvider } from "@/types/index";
import { Corridor } from "@/lib/corridors";
import { TransferMethod } from "@/types/core";

export interface QuoteEngineInput {
  provider: TransferProvider;
  corridor: Corridor;
  method: TransferMethod;
  amount: number;
}

export interface QuoteEngineResult {
  providerId: string;
  fromCurrency: string;
  toCurrency: string;
  sendAmount: number;
  rate: number;
  fee: number;
  receiveAmount: number;
  method: TransferMethod;
  provider: TransferProvider;
  corridor: Corridor;
}

/**
 * Pure quote calculation engine. No side effects, no API calls.
 */
export function calculateQuote({ provider, corridor, method, amount }: QuoteEngineInput): QuoteEngineResult {
  // Fee and rate logic can be extended for method/corridor-specific adjustments
  const rate = provider.exchangeRate;
  const fee = provider.fee;
  const sendAmount = amount;
  const receiveAmount = (sendAmount - fee) * rate;

  return {
    providerId: provider.id,
    fromCurrency: corridor.fromCurrency,
    toCurrency: corridor.toCurrency,
    sendAmount,
    rate,
    fee,
    receiveAmount,
    method,
    provider,
    corridor,
  };
}
