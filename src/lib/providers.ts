import { Provider } from "@/types/core";

export const providers: Provider[] = [
  {
    id: "wise",
    name: "Wise",
    websiteUrl: "https://wise.com",
    redirectStrategy: "homepage",
    supportsNGN: true,
  },
  {
    id: "remitly",
    name: "Remitly",
    websiteUrl: "https://www.remitly.com",
    redirectStrategy: "homepage",
    supportsNGN: true,
  },
  {
    id: "sendwave",
    name: "Sendwave",
    websiteUrl: "https://www.sendwave.com",
    redirectStrategy: "homepage",
    supportsNGN: true,
  },
];

export function getProviderById(id: string): Provider | undefined {
  return providers.find((provider) => provider.id === id);
}
