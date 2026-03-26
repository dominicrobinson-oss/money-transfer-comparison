
export type Corridor = {
  fromCurrency: string;
  toCurrency: string;
};

export const corridors: Corridor[] = [
  { fromCurrency: "gbp", toCurrency: "ngn" },
  { fromCurrency: "gbp", toCurrency: "ghs" },
  { fromCurrency: "gbp", toCurrency: "usd" },
  { fromCurrency: "usd", toCurrency: "ngn" },
  { fromCurrency: "eur", toCurrency: "inr" },
  { fromCurrency: "gbp", toCurrency: "pkr" },
  { fromCurrency: "gbp", toCurrency: "zar" }
];
