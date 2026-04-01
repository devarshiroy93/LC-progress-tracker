import { useRouter } from "next/router";
import type { ReactNode } from "react";

type Problem = {
  id: string;
  title: string;
  lc_number?: number;
  pattern?: string;
  difficulty?: string;
  times_shown?: number;
  last_shown_at?: string | null;
};

type ProblemsListProps = {
  problems: Problem[];
  getHref?: (id: string) => string;
  renderActions?: (problem: Problem) => ReactNode;
};

export default function ProblemsList({
  problems,
  getHref,
  renderActions,
}: ProblemsListProps) {
  const router = useRouter();

  const handleClick = (id: string) => {
    router.push(getHref ? getHref(id) : `/problems/${id}`);
  };

  if (problems.length === 0) {
    return (
      <p className="text-sm text-textSecondary text-center">
        No problems found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {problems.map((problem) => (
        <div
          key={problem.id}
          onClick={() => handleClick(problem.id)}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3 cursor-pointer transition hover:shadow-md hover:scale-[1.01]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              {problem.lc_number !== undefined && (
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-textSecondary">
                  LeetCode #{problem.lc_number}
                </p>
              )}
              <h3 className="mt-1 text-sm font-semibold text-primary">
                {problem.title}
              </h3>
            </div>

            {renderActions && (
              <div
                className="flex items-center gap-2"
                onClick={(event) => event.stopPropagation()}
              >
                {renderActions(problem)}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-textSecondary">
            {problem.pattern && (
              <span className="px-2 py-1 rounded bg-gray-100">
                {problem.pattern}
              </span>
            )}
            {problem.difficulty && (
              <span className="px-2 py-1 rounded bg-gray-100">
                {problem.difficulty}
              </span>
            )}
          </div>

          {problem.times_shown !== undefined && (
            <p className="text-xs text-textSecondary">
              Times shown:{" "}
              <span className="font-medium text-textPrimary">
                {problem.times_shown}
              </span>
            </p>
          )}

          {problem.last_shown_at && (
            <p className="text-xs text-textSecondary">
              Last shown: {new Date(problem.last_shown_at).toLocaleDateString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
