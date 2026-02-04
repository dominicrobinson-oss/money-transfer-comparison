import { Provider } from "@/types/core";

export const providers: Provider[] = [
  {
    id: "wise",
    name: "Wise",
    websiteUrl: "https://wise.com",
    supportsNGN: true,
  },
  {
    id: "remitly",
    name: "Remitly",
    websiteUrl: "https://www.remitly.com",
    supportsNGN: true,
  },
  {
    id: "sendwave",
    name: "Sendwave",
    websiteUrl: "https://www.sendwave.com",
    supportsNGN: true,
  },
];

export function getProviderById(id: string): Provider | undefined {
  return providers.find((provider) => provider.id === id);
}
