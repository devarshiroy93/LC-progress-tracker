import { useEffect, useRef, useState } from "react";
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

type Phase = "LOADING" | "IN_PROGRESS" | "SUMMARY";

export default function Mock() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [index, setIndex] = useState(0);
  const [showTitle, setShowTitle] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<Phase>("LOADING");
  const [solvedCount, setSolvedCount] = useState(0);
  const [notSolvedCount, setNotSolvedCount] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const hasLoadedInitialMock = useRef(false);

  const fetchMock = async () => {
    const res = await fetch("/api/mock?limit=3");
    const json = await res.json();

    setProblems(json.problems ?? []);
    setIndex(0);
    setShowTitle(false);
    setShowTimer(false);
    setElapsed(0);
    setSolvedCount(0);
    setNotSolvedCount(0);
    setTotalTime(0);
    setPhase("IN_PROGRESS");
  };

  useEffect(() => {
    if (hasLoadedInitialMock.current) {
      return;
    }

    hasLoadedInitialMock.current = true;
    void fetchMock();
  }, []);

  const problem = problems[index];
  const total = problems.length;

  const submitAttempt = async (status: "SOLVED" | "NOT_SOLVED") => {
    if (!problem) return;

    await fetch("/api/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problem_id: problem.id,
        status,
        attempt_time_seconds: elapsed,
      }),
    });

    if (status === "SOLVED") {
      setSolvedCount((count) => count + 1);
    } else {
      setNotSolvedCount((count) => count + 1);
    }

    setTotalTime((time) => time + elapsed);
    goNext();
  };

  const goNext = () => {
    setShowTitle(false);
    setShowTimer(false);
    setElapsed(0);

    if (index + 1 < total) {
      setIndex((currentIndex) => currentIndex + 1);
    } else {
      setPhase("SUMMARY");
    }
  };

  if (phase === "SUMMARY") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6 text-center">
          <h2 className="text-lg font-semibold text-textPrimary">
            Mock Completed
          </h2>

          <div className="space-y-2 text-sm text-textSecondary">
            <div>
              Total problems:{" "}
              <span className="font-medium">{total}</span>
            </div>
            <div>
              Solved:{" "}
              <span className="font-medium text-green-600">
                {solvedCount}
              </span>
            </div>
            <div>
              Not solved:{" "}
              <span className="font-medium text-red-600">
                {notSolvedCount}
              </span>
            </div>
            <div>
              Total time:{" "}
              <span className="font-medium">{totalTime}s</span>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => (window.location.href = "/")}
              className="flex-1 py-2 rounded-lg border border-gray-300 text-textPrimary hover:bg-gray-50"
            >
              Exit
            </button>

            <button
              onClick={fetchMock}
              className="flex-1 py-2 rounded-lg font-medium text-white bg-primary hover:opacity-90"
            >
              Try another mock
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "LOADING") {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-textSecondary">
        Loading problems...
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div className="flex items-center justify-between gap-3 text-sm text-textSecondary font-medium">
          <span>LeetCode #{problem.lc_number}</span>
          <span>
            {index + 1} / {total}
          </span>
          <button
            type="button"
            onClick={() => setShowTimer((current) => !current)}
            className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary transition hover:border-primary/40"
          >
            Timer On
          </button>
          <div className={showTimer ? "block" : "hidden"}>
            <Timer key={index} onTick={setElapsed} />
          </div>
        </div>

        <p className="text-sm text-textPrimary leading-relaxed">
          {problem.statement}
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm space-y-1">
          <div>
            <span className="font-medium">Input:</span>{" "}
            {problem.example_input}
          </div>
          <div>
            <span className="font-medium">Output:</span>{" "}
            {problem.example_output}
          </div>
          <div className="text-textSecondary text-xs">
            {problem.example_explanation}
          </div>
        </div>

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

