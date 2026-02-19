
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Money Transfer Comparison",
  description: "Read our privacy policy to understand how we handle your data and protect your privacy when using our money transfer comparison service.",
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="prose mx-auto py-8">
      <h1>Privacy Policy</h1>
      <p>
        We respect your privacy and are committed to protecting your personal information. This policy explains what data we collect, how we use it, and your rights.
      </p>
      <h2>What We Collect</h2>
      <ul>
        <li>Anonymous usage analytics (page views, clicks, conversion rates)</li>
        <li>No personal or financial data is collected</li>
        <li>No cookies or tracking for advertising purposes</li>
      </ul>
      <h2>How We Use Data</h2>
      <ul>
        <li>To improve site performance and user experience</li>
        <li>To monitor service reliability and detect abuse</li>
      </ul>
      <h2>Third Parties</h2>
      <p>
        We do not share your data with third parties except as required by law or for essential analytics (e.g., Vercel Analytics, error tracking).
      </p>
      <h2>Disclaimer</h2>
      <div className="border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-4 my-4 text-sm text-yellow-900 dark:text-yellow-100">
        <strong>Important:</strong> This site is for informational purposes only. By using this site, you agree to our <Link href="/terms">Terms</Link> and this Privacy Policy.
      </div>
      <h2>Contact</h2>
      <p>
        For privacy questions, contact <a href="mailto:privacy@werx-health.com">privacy@werx-health.com</a>.
      </p>
    </main>
  );
}
