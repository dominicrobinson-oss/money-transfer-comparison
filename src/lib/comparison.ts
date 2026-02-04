import { TransferProvider, TransferComparison, ComparisonResponse } from "@/types";

export function calculateComparison(
  provider: TransferProvider,
  sendAmount: number
): TransferComparison {
  const receiveAmount = sendAmount * provider.exchangeRate;
  const totalCost = provider.fee;

  return {
    sendAmount,
    receiveAmount,
    provider,
    totalCost,
  };
}

export function compareProviders(
  providers: TransferProvider[],
  amount: number
): ComparisonResponse {
  // Filter providers based on min/max limits
  const validProviders = providers.filter(
    (p) => amount >= p.minAmount && amount <= p.maxAmount
  );

  const comparisons = validProviders.map((provider) =>
    calculateComparison(provider, amount)
  );

  // Sort by receive amount (best rate)
  const sortedByRate = [...comparisons].sort(
    (a, b) => b.receiveAmount - a.receiveAmount
  );
  const bestRate = sortedByRate[0];

  // Find fastest transfer
  const speedPriority: { [key: string]: number } = {
    Instant: 1,
    "1-2 hours": 2,
    "1-3 hours": 3,
    "1-4 days": 4,
  };
  const fastestTransfer = comparisons.reduce((fastest, current) =>
    speedPriority[current.provider.transferSpeed] <
    speedPriority[fastest.provider.transferSpeed]
      ? current
      : fastest
  );

  // Find lowest fee
  const lowestFee = comparisons.reduce((lowest, current) =>
    current.provider.fee < lowest.provider.fee ? current : lowest
  );

  return {
    comparisons: sortedByRate,
    bestRate,
    fastestTransfer,
    lowestFee,
    timestamp: new Date().toISOString(),
  };
}
