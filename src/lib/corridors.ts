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
  countryName?: string; // e.g. "Nigeria", "United States"
}

export const corridors: Corridor[] = [
  // Active corridors (fully implemented)
  {
    id: "gbp-ngn",
    fromCurrency: "GBP",
    toCurrency: "NGN",
    label: "GBP to NGN",
    status: "active",
    countryName: "Nigeria",
  },
  {
    id: "gbp-ghs",
    fromCurrency: "GBP",
    toCurrency: "GHS",
    label: "GBP to GHS",
    status: "active",
    countryName: "Ghana",
  },
  {
    id: "gbp-zar",
    fromCurrency: "GBP",
    toCurrency: "ZAR",
    label: "GBP to ZAR",
    status: "active",
    countryName: "South Africa",
  },
  {
    id: "gbp-usd",
    fromCurrency: "GBP",
    toCurrency: "USD",
    label: "GBP to USD",
    status: "active",
    countryName: "United States",
  },
  {
    id: "gbp-eur",
    fromCurrency: "GBP",
    toCurrency: "EUR",
    label: "GBP to EUR",
    status: "active",
    countryName: "Europe",
  },
  {
    id: "gbp-cad",
    fromCurrency: "GBP",
    toCurrency: "CAD",
    label: "GBP to CAD",
    status: "active",
    countryName: "Canada",
  },
  
  // Informational corridors (popular currencies, not yet implemented)
  {
    id: "gbp-inr",
    fromCurrency: "GBP",
    toCurrency: "INR",
    label: "GBP to INR",
    status: "informational",
    countryName: "India",
  },
  {
    id: "gbp-pkr",
    fromCurrency: "GBP",
    toCurrency: "PKR",
    label: "GBP to PKR",
    status: "informational",
    countryName: "Pakistan",
  },
  {
    id: "gbp-kes",
    fromCurrency: "GBP",
    toCurrency: "KES",
    label: "GBP to KES",
    status: "informational",
    countryName: "Kenya",
  },
  {
    id: "gbp-php",
    fromCurrency: "GBP",
    toCurrency: "PHP",
    label: "GBP to PHP",
    status: "informational",
    countryName: "Philippines",
  },
  {
    id: "gbp-bdt",
    fromCurrency: "GBP",
    toCurrency: "BDT",
    label: "GBP to BDT",
    status: "informational",
    countryName: "Bangladesh",
  },
  {
    id: "gbp-jpy",
    fromCurrency: "GBP",
    toCurrency: "JPY",
    label: "GBP to JPY",
    status: "informational",
    countryName: "Japan",
  },
  {
    id: "gbp-aud",
    fromCurrency: "GBP",
    toCurrency: "AUD",
    label: "GBP to AUD",
    status: "informational",
    countryName: "Australia",
  },
  {
    id: "gbp-nzd",
    fromCurrency: "GBP",
    toCurrency: "NZD",
    label: "GBP to NZD",
    status: "informational",
    countryName: "New Zealand",
  },
  {
    id: "gbp-chf",
    fromCurrency: "GBP",
    toCurrency: "CHF",
    label: "GBP to CHF",
    status: "informational",
    countryName: "Switzerland",
  },
  {
    id: "gbp-sgd",
    fromCurrency: "GBP",
    toCurrency: "SGD",
    label: "GBP to SGD",
    status: "informational",
    countryName: "Singapore",
  },
  {
    id: "gbp-hkd",
    fromCurrency: "GBP",
    toCurrency: "HKD",
    label: "GBP to HKD",
    status: "informational",
    countryName: "Hong Kong",
  },
  {
    id: "gbp-mxn",
    fromCurrency: "GBP",
    toCurrency: "MXN",
    label: "GBP to MXN",
    status: "informational",
    countryName: "Mexico",
  },
  {
    id: "gbp-brl",
    fromCurrency: "GBP",
    toCurrency: "BRL",
    label: "GBP to BRL",
    status: "informational",
    countryName: "Brazil",
  },
  {
    id: "gbp-try",
    fromCurrency: "GBP",
    toCurrency: "TRY",
    label: "GBP to TRY",
    status: "informational",
    countryName: "Turkey",
  },
  {
    id: "gbp-thb",
    fromCurrency: "GBP",
    toCurrency: "THB",
    label: "GBP to THB",
    status: "informational",
    countryName: "Thailand",
  },
  {
    id: "gbp-egp",
    fromCurrency: "GBP",
    toCurrency: "EGP",
    label: "GBP to EGP",
    status: "informational",
    countryName: "Egypt",
  },
  {
    id: "gbp-lkr",
    fromCurrency: "GBP",
    toCurrency: "LKR",
    label: "GBP to LKR",
    status: "informational",
    countryName: "Sri Lanka",
  },
  {
    id: "gbp-ugx",
    fromCurrency: "GBP",
    toCurrency: "UGX",
    label: "GBP to UGX",
    status: "informational",
    countryName: "Uganda",
  },
  {
    id: "gbp-tzs",
    fromCurrency: "GBP",
    toCurrency: "TZS",
    label: "GBP to TZS",
    status: "informational",
    countryName: "Tanzania",
  },
  {
    id: "gbp-rwf",
    fromCurrency: "GBP",
    toCurrency: "RWF",
    label: "GBP to RWF",
    status: "informational",
    countryName: "Rwanda",
  },
  {
    id: "gbp-mad",
    fromCurrency: "GBP",
    toCurrency: "MAD",
    label: "GBP to MAD",
    status: "informational",
    countryName: "Morocco",
  },
  {
    id: "gbp-jmd",
    fromCurrency: "GBP",
    toCurrency: "JMD",
    label: "GBP to JMD",
    status: "informational",
    countryName: "Jamaica",
  },
  {
    id: "gbp-ttd",
    fromCurrency: "GBP",
    toCurrency: "TTD",
    label: "GBP to TTD",
    status: "informational",
    countryName: "Trinidad and Tobago",
  },
  {
    id: "gbp-xof",
    fromCurrency: "GBP",
    toCurrency: "XOF",
    label: "GBP to XOF",
    status: "informational",
    countryName: "West Africa (CFA)",
  },
  {
    id: "gbp-xaf",
    fromCurrency: "GBP",
    toCurrency: "XAF",
    label: "GBP to XAF",
    status: "informational",
    countryName: "Central Africa (CFA)",
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
