/**
 * Supported Money Transfer Corridors
 * Defines the currency pairs that the app supports for comparison
 */

export interface Corridor {
  id: string; // e.g. "gbp-ngn", "gbp-ghs"
  fromCurrency: string;
  toCurrency: string;
  label: string; // Human readable, e.g. "GBP → NGN"
  status: "active" | "informational" | "coming-soon";
}

export const corridors: Corridor[] = [
  {
    id: "gbp-ngn",
    fromCurrency: "GBP",
    toCurrency: "NGN",
    label: "GBP to NGN",
    status: "active",
  },
  {
    id: "gbp-ghs",
    fromCurrency: "GBP",
    toCurrency: "GHS",
    label: "GBP to GHS",
    status: "active",
  },
  {
    id: "gbp-zar",
    fromCurrency: "GBP",
    toCurrency: "ZAR",
    label: "GBP to ZAR",
    status: "active",
  },
  {
    id: "gbp-usd",
    fromCurrency: "GBP",
    toCurrency: "USD",
    label: "GBP to USD",
    status: "active",
  },
  {
    id: "gbp-eur",
    fromCurrency: "GBP",
    toCurrency: "EUR",
    label: "GBP to EUR",
    status: "active",
  },
  {
    id: "gbp-cad",
    fromCurrency: "GBP",
    toCurrency: "CAD",
    label: "GBP to CAD",
    status: "active",
  },
  {
    id: "gbp-kes",
    fromCurrency: "GBP",
    toCurrency: "KES",
    label: "GBP to KES",
    status: "coming-soon",
  },
];

/**
 * Get a corridor by its ID
 * @param id The corridor ID (e.g. "gbp-ngn")
 * @returns The corridor object or undefined if not found
 */
export function getCorridorById(id: string): Corridor | undefined {
  return corridors.find((corridor) => corridor.id === id);
}

/**
 * Get a corridor by currency pair
 * @param fromCurrency Source currency code
 * @param toCurrency Target currency code
 * @returns The corridor object or undefined if not found
 */
export function getCorridorByPair(
  fromCurrency: string,
  toCurrency: string
): Corridor | undefined {
  return corridors.find(
    (corridor) =>
      corridor.fromCurrency === fromCurrency &&
      corridor.toCurrency === toCurrency
  );
}
