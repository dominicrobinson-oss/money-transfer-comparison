import { Promotion, TransferMethod } from "@/types/core";

/**
 * Promotion registry
 * Informational only - does not affect rate or fee calculations
 */
export const promotions: Promotion[] = [
  {
    id: "wise-fee-free-new",
    providerId: "wise",
    promoType: "fee-free",
    eligibility: "New customers",
    expiryDate: "2026-03-31",
    disclaimerText: "Fee waived on first transfer. Terms apply.",
    badgeLabel: "New User",
  },
  {
    id: "remitly-bonus-ngn",
    providerId: "remitly",
    corridor: "GBP-NGN",
    promoType: "bonus",
    eligibility: "First transfer",
    expiryDate: "2026-02-28",
    disclaimerText: "Receive a cash bonus on your first GBP to NGN transfer.",
  },
  {
    id: "sendwave-boosted-card",
    providerId: "sendwave",
    transferMethod: "card",
    promoType: "boosted-rate",
    eligibility: "Card payments",
    expiryDate: "2026-04-30",
    disclaimerText: "Boosted rates for debit card transfers.",
  },
];

/**
 * Get applicable promotions for a provider in a specific context
 * Returns all matching promotions (may be multiple)
 */
export function getApplicablePromos(
  providerId: string,
  corridor?: string,
  transferMethod?: TransferMethod
): Promotion[] {
  return promotions.filter((promo) => {
    // Provider must match
    if (promo.providerId !== providerId) {
      return false;
    }

    // Corridor must match (if promo specifies one)
    if (promo.corridor && promo.corridor !== corridor) {
      return false;
    }

    // Transfer method must match (if promo specifies one)
    if (promo.transferMethod && promo.transferMethod !== transferMethod) {
      return false;
    }

    // Check if promotion has expired
    const expiryDate = new Date(promo.expiryDate);
    if (expiryDate < new Date()) {
      return false;
    }

    return true;
  });
}

/**
 * Check if a provider has any applicable promotion
 */
export function hasActivePromo(
  providerId: string,
  corridor?: string,
  transferMethod?: TransferMethod
): boolean {
  return getApplicablePromos(providerId, corridor, transferMethod).length > 0;
}
