import { TransferProvider } from "@/types";

// Mock data for transfer providers
// In production, this would come from a database or external APIs

export const transferProviders: TransferProvider[] = [
  {
    id: "wise",
    name: "Wise",
    url: "https://wise.com",
    exchangeRate: 2050.50,
    fee: 3.50,
    transferSpeed: "1-2 hours",
    minAmount: 1,
    maxAmount: 1000000,
  },
  {
    id: "western-union",
    name: "Western Union",
    url: "https://www.westernunion.com",
    exchangeRate: 2020.00,
    fee: 5.00,
    transferSpeed: "Instant",
    minAmount: 10,
    maxAmount: 500000,
  },
  {
    id: "remitly",
    name: "Remitly",
    url: "https://www.remitly.com",
    exchangeRate: 2040.75,
    fee: 2.99,
    transferSpeed: "1-3 hours",
    minAmount: 10,
    maxAmount: 250000,
  },
  {
    id: "worldremit",
    name: "WorldRemit",
    url: "https://www.worldremit.com",
    exchangeRate: 2035.25,
    fee: 3.99,
    transferSpeed: "Instant",
    minAmount: 1,
    maxAmount: 900000,
  },
  {
    id: "xe",
    name: "XE Money Transfer",
    url: "https://www.xe.com",
    exchangeRate: 2045.00,
    fee: 0,
    transferSpeed: "1-4 days",
    minAmount: 10,
    maxAmount: 500000,
  },
];
