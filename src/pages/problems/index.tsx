import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ProblemsList from "../../components/ProblemList";

type Problem = {
  id: string;
  title: string;
  lc_number: number;
  times_shown: number;
  last_shown_at?: string | null;
};

export default function ProblemsPage() {
  const router = useRouter();
  const { filter } = router.query;

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filter) return;

    const fetchProblems = async () => {
      try {
        const res = await fetch(`/api/problems?filter=${filter}`);
        if (!res.ok) {
          throw new Error("Failed to fetch problems");
        }

        const data = await res.json();
        setProblems(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load problems");
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [filter]);

  return (
    <main className="min-h-screen px-4 py-6 max-w-5xl mx-auto space-y-6">

      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-block text-sm font-medium text-primary hover:underline"
      >
        ← Back to Dashboard
      </Link>

      <h1 className="text-lg font-semibold text-textPrimary">
        {filter === "shown"
          ? "Problems Shown"
          : "Problems Not Shown"}
      </h1>

      {loading && (
        <p className="text-sm text-textSecondary">Loading…</p>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!loading && !error && (
        <ProblemsList problems={problems} />
      )}
    </main>
  );
}
