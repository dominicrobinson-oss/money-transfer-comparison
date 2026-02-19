
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Money Transfer Comparison",
  description: "Learn about our mission, methodology, and commitment to transparency in comparing international money transfer services.",
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <main className="prose mx-auto py-8">
      <h1>About Money Transfer Comparison</h1>
      <p>
        Money Transfer Comparison is dedicated to helping users find the best GBP to NGN money transfer rates. Our mission is to provide transparent, accurate, and up-to-date information so you can make informed decisions when sending money internationally.
      </p>
      <h2>How We Compare</h2>
      <ul>
        <li>We independently collect and verify rates from leading providers.</li>
        <li>All comparisons are unbiased and based on real-time or recent data.</li>
        <li>We do not accept payment for ranking placement.</li>
      </ul>
      <h2>Disclaimer</h2>
      <div className="border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-4 my-4 text-sm text-yellow-900 dark:text-yellow-100">
        <strong>Important:</strong> We are not a money transfer provider. All information is for comparison purposes only. Please verify rates and fees with the provider before making a transaction. We do not provide financial advice. See our <Link href="/terms">Terms</Link> and <Link href="/privacy-policy">Privacy Policy</Link> for details.
      </div>
      <h2>Contact</h2>
      <p>
        For questions or feedback, please email <a href="mailto:support@werx-health.com">support@werx-health.com</a>.
      </p>
    </main>
  );
}
