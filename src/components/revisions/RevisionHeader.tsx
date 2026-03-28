import Link from "next/link";

type RevisionHeaderProps = {
  title: string;
  linkedProblem: string;
  onTitleChange: (value: string) => void;
  onLinkedProblemChange: (value: string) => void;
};

export default function RevisionHeader({
  title,
  linkedProblem,
  onTitleChange,
  onLinkedProblemChange,
}: RevisionHeaderProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Link
              href="/dashboard"
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              Back to Dashboard
            </Link>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-textSecondary">
                Revision Authoring
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-textPrimary">
                Create Revision Note
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-textSecondary">
                Draft concise writeups, store snippets, and preview how the
                note will look during revision.
              </p>
            </div>
          </div>

          <div className="rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            Draft
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          <label className="space-y-2">
            <span className="text-sm font-medium text-textPrimary">
              Revision Title
            </span>
            <input
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Ex. Sliding Window - Keep the invariant tight"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-textPrimary">
              Linked Problem
            </span>
            <input
              value={linkedProblem}
              onChange={(event) => onLinkedProblemChange(event.target.value)}
              placeholder="Ex. 3. Longest Substring Without Repeating Characters"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
