import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best GBP to EUR Exchange Rate Today | Compare Money Transfer Providers",
  description: "Compare real-time GBP to EUR exchange rates from trusted money transfer providers. Send money to Europe with the best rates and lowest fees.",
  alternates: {
    canonical: "https://money-transfer-comparison.com/gbp-to-eur",
  },
};

export default function GbpToEurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
