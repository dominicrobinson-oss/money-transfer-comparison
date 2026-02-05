import { Quote, TransferMethod, METHOD_PROFILES } from "@/types/core";

/**
 * Apply method-based adjustments to a quote
 * Transparent, assumption-based - not per-provider hacks
 */
export function applyMethodAdjustment(
  quote: Quote,
  method: TransferMethod
): Quote {
  const profile = METHOD_PROFILES[method];
  
  // Apply rate multiplier
  const adjustedRate = quote.rate * profile.rateMultiplier;
  
  // Apply fee adjustment
  const adjustedFee = quote.fee + profile.feeAdjustment;
  
  // Recalculate receive amount
  const adjustedReceiveAmount = Math.max(
    0,
    (quote.sendAmount - adjustedFee) * adjustedRate
  );

  return {
    ...quote,
    rate: adjustedRate,
    fee: adjustedFee,
    receiveAmount: adjustedReceiveAmount,
  };
}
