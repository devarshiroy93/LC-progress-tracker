import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

type ProblemDetail = {
  id: string;
  title: string;
  lc_number: number;
  statement: string;
  example_input: string;
  example_output: string;
  example_explanation: string;
  times_shown: number;
  last_shown_at?: string | null;
};

export default function ProblemDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProblem = async () => {
      try {
        const res = await fetch(`/api/problems/${id}`);
        if (!res.ok) throw new Error("Failed to fetch problem");

        const data = await res.json();
        setProblem(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load problem");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-6 max-w-4xl mx-auto">
        <p className="text-sm text-textSecondary">Loading…</p>
      </main>
    );
  }

  if (error || !problem) {
    return (
      <main className="min-h-screen px-4 py-6 max-w-4xl mx-auto">
        <p className="text-sm text-red-600">{error || "Problem not found"}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 max-w-4xl mx-auto space-y-6">

      {/* Back Link */}
      <Link
        href="/problems"
        className="inline-block text-sm font-medium text-primary hover:underline"
      >
        ← Back to Problems
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-textPrimary">
          {problem.lc_number}. {problem.title}
        </h1>

        <div className="flex gap-4 text-sm text-textSecondary">
          <span>Times Shown: {problem.times_shown}</span>
          {problem.last_shown_at && (
            <span>
              Last Shown:{" "}
              {new Date(problem.last_shown_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Statement */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Problem Statement</h2>
        <p className="text-sm leading-relaxed whitespace-pre-line">
          {problem.statement}
        </p>
      </section>

      {/* Example */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Example</h2>

        <div className="bg-muted p-4 rounded-lg text-sm font-mono">
          <p>
            <span className="font-semibold">Input:</span>{" "}
            {problem.example_input}
          </p>
          <p>
            <span className="font-semibold">Output:</span>{" "}
            {problem.example_output}
          </p>
        </div>

        {problem.example_explanation && (
          <p className="text-sm text-textSecondary">
            <span className="font-semibold">Explanation:</span>{" "}
            {problem.example_explanation}
          </p>
        )}
      </section>
    </main>
  );
}