export default function Loading() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4" />
      <p className="text-lg text-gray-700">Loading comparison data…</p>
    </main>
  );
}
