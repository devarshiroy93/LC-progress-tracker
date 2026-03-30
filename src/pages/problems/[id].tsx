import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

import ProblemCodeEditor from "@/components/problems/ProblemCodeEditor";

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
  const [showEditor, setShowEditor] = useState(false);

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

    void fetchProblem();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
        <p className="text-sm text-textSecondary">Loading...</p>
      </main>
    );
  }

  if (error || !problem) {
    return (
      <main className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
        <p className="text-sm text-red-600">{error || "Problem not found"}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 max-w-7xl mx-auto space-y-6">
      <Link
        href="/dashboard"
        className="inline-block text-sm font-medium text-primary hover:underline"
      >
        Back to Problems
      </Link>

      <div className={`grid gap-6 ${showEditor ? "md:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)]" : "grid-cols-1"}`}>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">
          <div className="flex items-start justify-between gap-4 border-b pb-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-textPrimary">
                {problem.lc_number}. {problem.title}
              </h1>

              <div className="flex gap-6 text-sm text-textSecondary">
                <span>
                  Times Shown:{" "}
                  <span className="font-medium text-textPrimary">
                    {problem.times_shown}
                  </span>
                </span>

                {problem.last_shown_at && (
                  <span>
                    Last Shown:{" "}
                    {new Date(problem.last_shown_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowEditor((current) => !current)}
              className="hidden md:inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-textPrimary transition hover:border-primary hover:text-primary"
            >
              <span className="font-mono text-xs">&lt;/&gt;</span>
              {showEditor ? "Hide Code" : "Code Now"}
            </button>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-textPrimary">
              Problem Statement
            </h2>

            <p className="text-sm leading-relaxed whitespace-pre-line text-gray-700">
              {problem.statement}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-textPrimary">
              Example
            </h2>

            <div className="bg-gray-50 border rounded-lg p-4 text-sm font-mono space-y-2">
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
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Explanation:</span>{" "}
                {problem.example_explanation}
              </p>
            )}
          </section>
        </div>

        {showEditor && <ProblemCodeEditor />}
      </div>
    </main>
  );
}
