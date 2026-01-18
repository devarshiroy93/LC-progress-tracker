import { useEffect, useState } from "react";
import Timer from "../../components/timer";

type Problem = {
  id: string;
  lc_number: number;
  title: string;
  statement: string;
  example_input: string;
  example_output: string;
  example_explanation: string;
};

export default function Mock() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [index, setIndex] = useState(0);
  const [showTitle, setShowTitle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(0); // ✅ timer value

  // --------------------
  // Initial fetch
  // --------------------
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      const res = await fetch("/api/mock?limit=3");
      const json = await res.json();

      if (cancelled) return;

      setProblems(json.problems ?? []);
      setIndex(0);
      setShowTitle(false);
      setElapsed(0);
      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const problem = problems[index];
  const total = problems.length;

  // --------------------
  // Submit attempt
  // --------------------
  const submitAttempt = async (status: "SOLVED" | "NOT_SOLVED") => {
    if (!problem) return;

    await fetch("/api/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problem_id: problem.id,
        status,
        attempt_time_seconds: elapsed // ✅ captured time
      })
    });

    goNext();
  };

  // --------------------
  // Navigation
  // --------------------
  const goNext = () => {
    setShowTitle(false);
    setElapsed(0);

    if (index + 1 < total) {
      setIndex(i => i + 1);
    } else {
      refetch();
    }
  };

  const refetch = async () => {
    setLoading(true);

    const res = await fetch("/api/mock?limit=3");
    const json = await res.json();

    setProblems(json.problems ?? []);
    setIndex(0);
    setShowTitle(false);
    setElapsed(0);
    setLoading(false);
  };

  // --------------------
  // Guards
  // --------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-textSecondary">
        Loading problems…
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-textSecondary">
        No problems available
      </div>
    );
  }

  // --------------------
  // UI
  // --------------------
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">

        {/* Top Row */}
        <div className="flex items-center justify-between text-sm text-textSecondary font-medium">
          <span>LeetCode #{problem.lc_number}</span>
          <span>{index + 1} / {total}</span>
          <Timer key={index} onTick={setElapsed} />
        </div>

        {/* Statement */}
        <p className="text-sm text-textPrimary leading-relaxed">
          {problem.statement}
        </p>

        {/* Example */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm space-y-1">
          <div>
            <span className="font-medium">Input:</span> {problem.example_input}
          </div>
          <div>
            <span className="font-medium">Output:</span> {problem.example_output}
          </div>
          <div className="text-textSecondary text-xs">
            {problem.example_explanation}
          </div>
        </div>

        {/* Title Reveal */}
        {!showTitle ? (
          <button
            onClick={() => setShowTitle(true)}
            className="text-xs text-primary hover:underline"
          >
            Show problem title
          </button>
        ) : (
          <div className="text-xs text-textSecondary">
            {problem.title}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-2">
          <button
            onClick={() => submitAttempt("SOLVED")}
            className="flex-1 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition"
          >
            Solved
          </button>

          <button
            onClick={() => submitAttempt("NOT_SOLVED")}
            className="flex-1 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition"
          >
            Not Solved
          </button>
        </div>
      </div>
    </div>
  );
}
