import { useEffect, useState } from "react";
import Link from "next/link";

type DashboardCounts = {
  shown_count: number;
  not_shown_count: number;
};

export default function DashboardPage() {
  const [shownCount, setShownCount] = useState<number | null>(null);
  const [notShownCount, setNotShownCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/dashboard/counts");
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard counts");
        }

        const data: DashboardCounts = await res.json();
        setShownCount(data.shown_count);
        setNotShownCount(data.not_shown_count);
      } catch (err) {
        console.error(err);
        setError("Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return (
    <main className="min-h-screen px-4 py-6 flex flex-col">

      {/* Back link */}
      <div className="w-full max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-block text-sm font-medium text-primary hover:underline"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Centered content */}
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Problems Shown */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-500">
                Problems Shown Till Now
              </h2>
              <p className="mt-2 text-4xl font-semibold text-gray-900">
                {loading ? "…" : shownCount}
              </p>
            </div>

            <Link
              href="/problems?filter=shown"
              className="mt-6 inline-flex items-center text-sm font-medium text-purple-700 hover:text-purple-800"
            >
              View list →
            </Link>
          </div>

          {/* Problems Not Shown */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-500">
                Problems Not Shown Till Now
              </h2>
              <p className="mt-2 text-4xl font-semibold text-gray-900">
                {loading ? "…" : notShownCount}
              </p>
            </div>

            <Link
              href="/problems?filter=not_shown"
              className="mt-6 inline-flex items-center text-sm font-medium text-purple-700 hover:text-purple-800"
            >
              View list →
            </Link>
          </div>

        </div>
      </div>

      {error && (
        <p className="mt-6 text-sm text-red-600 text-center">
          {error}
        </p>
      )}
    </main>
  );
}
