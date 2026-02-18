
function ProblemRow({
  status,
  title,
  difficulty,
}: {
  status: "done" | "progress" | "locked";
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
}) {
  const icon =
    status === "done" ? "✓" : status === "progress" ? "⏳" : "🔒";

  const difficultyColor =
    difficulty === "Easy"
      ? "text-green-600"
      : difficulty === "Medium"
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <li className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm">
      <div className="flex items-center gap-3 text-textPrimary">
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      <span className={`font-medium ${difficultyColor}`}>
        {difficulty}
      </span>
    </li>
  );
}

export default ProblemRow;