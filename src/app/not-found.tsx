import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404 – Page Not Found</h1>
      <p className="text-lg text-gray-700 mb-8">
        Sorry, the page or corridor you are looking for does not exist.
      </p>
      <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
        Go Home
      </Link>
    </main>
  );
}
