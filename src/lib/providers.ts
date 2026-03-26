import { Provider } from "@/types/core";

export const providers: Provider[] = [
  {
    id: "wise",
    name: "Wise",
    logo: "/icons/providers/wise.png",
    websiteUrl: "https://wise.com",
    redirectStrategy: "homepage",
    supportsNGN: true,
    supportedMethods: ["bank", "card"],
    supportedCurrencies: ["NGN", "GHS", "ZAR", "USD", "EUR", "CAD", "KES", "UGX", "TZS", "INR", "PHP", "BDT", "JPY", "AUD", "NZD", "CHF", "SGD", "HKD", "THB"],
    payoutTypes: ["bank", "mobile-wallet"],
    typicalSpeed: "Minutes to 1 hour",
  },
  {
    id: "remitly",
    name: "Remitly",
    logo: "/icons/providers/remitly.png",
    websiteUrl: "https://www.remitly.com",
    redirectStrategy: "homepage",
    supportsNGN: true,
    supportedMethods: ["bank", "card", "wallet"],
    supportedCurrencies: ["NGN", "GHS", "KES", "UGX", "TZS", "RWF", "INR", "PKR", "PHP", "BDT", "LKR"],
    payoutTypes: ["bank", "cash", "mobile-wallet", "home-delivery"],
    typicalSpeed: "Minutes to 2 days",
  },
  {
    id: "sendwave",
    name: "Sendwave",
    logo: "/icons/providers/sendwave.png",
    websiteUrl: "https://www.sendwave.com",
    redirectStrategy: "homepage",
    supportsNGN: true,
    supportedMethods: ["bank", "card", "wallet"],
    supportedCurrencies: ["NGN", "GHS", "KES", "UGX", "TZS", "RWF"],
    payoutTypes: ["mobile-wallet"],
    typicalSpeed: "Minutes",
  },
];

export function getProviderById(id: string): Provider | undefined {
  return providers.find((provider) => provider.id === id);
}

export function getProvidersByCurrency(currency: string): Provider[] {
  return providers.filter((provider) => 
    provider.supportedCurrencies.includes(currency)
  );
}

export function getProvidersForCorridor(fromCurrency: string, toCurrency: string): Provider[] {
  return providers.filter((provider) => 
    provider.supportedCurrencies.includes(toCurrency)
  );
}
