import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best GBP to NGN Exchange Rate Today | Compare Money Transfer Providers",
  description:
    "Compare real-time GBP to NGN exchange rates from trusted money transfer providers. Find the best rates, lowest fees, and fastest transfers updated live.",
  alternates: {
    canonical: "https://money-transfer-comparison.com/gbp-to-ngn",
  },
};

export default function GbpToNgnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
