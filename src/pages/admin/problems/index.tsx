import Link from "next/link";
import { useEffect, useState } from "react";

import ProblemsList from "@/components/ProblemList";

type AdminProblem = {
  id: string;
  lc_number: number;
  title: string;
};

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState<AdminProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadProblems = async () => {
    try {
      const response = await fetch("/api/admin/problems");
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Failed to load problems");
      }

      setProblems(json.problems ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProblems();
  }, []);

  const handleDelete = async (problemId: string) => {
    const confirmed = window.confirm("Delete this problem?");
    if (!confirmed) {
      return;
    }

    setMessage(null);

    const response = await fetch(`/api/admin/problems/${problemId}`, {
      method: "DELETE",
    });
    const json = await response.json();

    if (!response.ok) {
      setMessage(json.error ?? "Unable to delete problem");
      return;
    }

    setProblems((current) => current.filter((problem) => problem.id !== problemId));
    setMessage("Problem deleted.");
  };

  return (
    <main className="min-h-screen bg-bg px-4 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm font-medium text-primary hover:underline">
              Back to Admin
            </Link>
            <h1 className="mt-2 text-3xl font-semibold text-textPrimary">Manage Problems</h1>
            <p className="mt-1 text-sm text-textSecondary">
              Edit or delete problems from this list. Adding new ones still happens in the existing add page.
            </p>
          </div>

          <Link
            href="/problems/add"
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primaryHover"
          >
            Add Problems
          </Link>
        </div>

        {message && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
            {message}
          </div>
        )}

        {loading && <p className="text-sm text-textSecondary">Loading problems...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <ProblemsList
            problems={problems}
            getHref={(id) => `/admin/problems/${id}/edit`}
            renderActions={(problem) => (
              <button
                type="button"
                onClick={() => void handleDelete(problem.id)}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
              >
                Delete
              </button>
            )}
          />
        )}
      </div>
    </main>
  );
}
