
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Money Transfer Comparison",
  description: "Review the terms and conditions for using our money transfer comparison service.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <main className="prose mx-auto py-8">
      <h1>Terms &amp; Conditions</h1>
      <p>
        By using Money Transfer Comparison, you agree to the following terms and conditions. Please read them carefully.
      </p>
      <h2>Service Scope</h2>
      <ul>
        <li>This site provides information for comparing money transfer providers and rates.</li>
        <li>We do not offer money transfer services or financial advice.</li>
        <li>All rates and fees are subject to change and should be verified with the provider.</li>
      </ul>
      <h2>Liability</h2>
      <ul>
        <li>We are not liable for any loss or damages resulting from the use of this site or third-party providers.</li>
        <li>Users are responsible for verifying all information before making decisions.</li>
      </ul>
      <h2>Disclaimer</h2>
      <div className="border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-4 my-4 text-sm text-yellow-900 dark:text-yellow-100">
        <strong>Important:</strong> Use of this site constitutes acceptance of these terms. See our <Link href="/privacy-policy">Privacy Policy</Link> for details.
      </div>
      <h2>Contact</h2>
      <p>
        For legal inquiries, contact <a href="mailto:legal@werx-health.com">legal@werx-health.com</a>.
      </p>
    </main>
  );
}
