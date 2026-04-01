import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-bg px-4 py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-textSecondary">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-textPrimary">
            Problem Admin Panel
          </h1>
          <p className="mt-2 text-sm text-textSecondary">
            Manage your problem bank from here. Add new problems, edit existing ones, or remove problems you no longer want.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/admin/problems"
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-textPrimary">Manage Problems</h2>
            <p className="mt-2 text-sm text-textSecondary">
              Browse the full list, edit any problem, and delete directly from the list view.
            </p>
          </Link>

          <Link
            href="/problems/add"
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-textPrimary">Add Problems</h2>
            <p className="mt-2 text-sm text-textSecondary">
              Reuse the existing add-problem flow for single and bulk inserts.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
