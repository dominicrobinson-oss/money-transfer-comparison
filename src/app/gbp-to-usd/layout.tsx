import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best GBP to USD Exchange Rate Today | Compare Money Transfer Providers",
  description: "Compare real-time GBP to USD exchange rates from trusted money transfer providers. Send money to USA with the best rates and lowest fees.",
  alternates: {
    canonical: "https://money-transfer-comparison.com/gbp-to-usd",
  },
};

export default function GbpToUsdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
