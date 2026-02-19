import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How Rates Work | Money Transfer Comparison",
  description: "Understand how exchange rates, fees, and provider margins affect your money transfer.",
  robots: { index: true, follow: true },
};

export default function HowRatesWorkPage() {
  return (
    <main className="prose mx-auto py-8">
      <h1>How Rates Work</h1>
      <p>
        Understanding how money transfer rates are calculated helps you make better decisions. Here’s what you need to know:
      </p>
      <h2>Exchange Rate</h2>
      <p>
        The exchange rate is the rate at which your GBP is converted to NGN. Providers may offer different rates based on market conditions and their own margins.
      </p>
      <h2>Fees</h2>
      <p>
        Providers may charge a fixed fee, a percentage fee, or both. Always check the total cost before sending money.
      </p>
      <h2>Provider Margin</h2>
      <p>
        The margin is the difference between the provider’s rate and the mid-market rate. Lower margins usually mean better value for you.
      </p>
      <h2>Disclaimer</h2>
      <div className="border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-4 my-4 text-sm text-yellow-900 dark:text-yellow-100">
        <strong>Important:</strong> All rates and fees are subject to change. Always verify with the provider before making a transfer. This page is for informational purposes only.
      </div>
      <h2>Questions?</h2>
      <p>
        Contact <a href="mailto:support@werx-health.com">support@werx-health.com</a> for more information.
      </p>
    </main>
  );
}
