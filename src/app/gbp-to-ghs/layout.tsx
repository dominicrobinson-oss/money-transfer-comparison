import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best GBP to GHS Exchange Rate Today | Compare Money Transfer Providers",
  description:
    "Compare real-time GBP to GHS exchange rates from trusted money transfer providers. Find the best rates, lowest fees, and fastest transfers to Ghana updated live.",
  alternates: {
    canonical: "https://money-transfer-comparison.com/gbp-to-ghs",
  },
};

export default function GbpToGhsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
