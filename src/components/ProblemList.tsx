import { useRouter } from "next/router";

type Problem = {
  id: string;
  title: string;
  pattern?: string;
  difficulty?: string;
  times_shown?: number;
  last_shown_at?: string | null;
};

type ProblemsListProps = {
  problems: Problem[];
};

export default function ProblemsList({ problems }: ProblemsListProps) {
  const router = useRouter();

  const handleClick = (id: string) => {
    router.push(`/problems/${id}`);
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
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2 cursor-pointer transition hover:shadow-md hover:scale-[1.01]"
        >
          {/* Header */}
          <h3 className="text-sm font-semibold text-primary">
            {problem.title}
          </h3>

          {/* Tags */}
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

          {/* Stats */}
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
              Last shown:{" "}
              {new Date(problem.last_shown_at).toLocaleDateString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}