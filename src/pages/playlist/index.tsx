import ProblemRow from "./ProblemRow";

export default function PlaylistPage() {
  return (
    <div className="min-h-screen bg-background flex justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-textPrimary">
            Playlists
          </h1>
          <p className="text-sm text-textSecondary">
            Topic-based DSA practice
          </p>
        </div>

        {/* Playlist Card */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-textPrimary">
              Sliding Window
            </h2>
            <span className="text-sm text-textSecondary">
              20 problems
            </span>
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-textSecondary">
              <span>Progress</span>
              <span>8 / 20</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full w-[40%] bg-primary" />
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-gray-100 text-textSecondary">
              Easy
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-textSecondary">
              Medium
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-textSecondary">
              Hard
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-textSecondary">
              Core idea: Window + invariant
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-2">
            <button className="flex-1 py-2 rounded-lg font-medium text-white bg-primary hover:opacity-90">
              Continue Playlist
            </button>
            <button className="flex-1 py-2 rounded-lg border border-gray-300 text-textPrimary hover:bg-gray-50">
              View All Problems
            </button>
          </div>
        </section>

        {/* Problems */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-textPrimary">
            Problems
          </h3>

          <ul className="space-y-2">
            <ProblemRow status="done" title="643. Maximum Average Subarray I" difficulty="Easy" />
            <ProblemRow status="done" title="121. Best Time to Buy and Sell Stock" difficulty="Easy" />
            <ProblemRow status="done" title="567. Permutation in String" difficulty="Medium" />
            <ProblemRow status="done" title="424. Longest Repeating Character Replacement" difficulty="Medium" />
            <ProblemRow status="progress" title="3. Longest Substring Without Repeating Characters" difficulty="Medium" />
            <ProblemRow status="progress" title="904. Fruit Into Baskets" difficulty="Medium" />
            <ProblemRow status="locked" title="239. Sliding Window Maximum" difficulty="Hard" />
            <ProblemRow status="locked" title="76. Minimum Window Substring" difficulty="Hard" />
          </ul>
        </section>
      </div>
    </div>
  );
}