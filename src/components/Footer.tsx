import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-gray-50 dark:bg-gray-900 py-6 mt-12 text-center text-sm text-gray-600 dark:text-gray-300">
      <nav className="flex flex-wrap justify-center gap-4 mb-2">
        <Link href="/about" className="hover:underline">About</Link>
        <Link href="/how-rates-work" className="hover:underline">How Rates Work</Link>
        <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
        <Link href="/terms" className="hover:underline">Terms</Link>
      </nav>
      <div className="text-xs text-gray-400 dark:text-gray-500">
        &copy; {new Date().getFullYear()} Money Transfer Comparison. All rights reserved.
      </div>
    </footer>
  );
}
