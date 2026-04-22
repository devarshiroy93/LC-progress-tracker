import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ProblemOption = {
  id: string;
  lc_number: number;
  title: string;
};

type ProgressEntry = {
  id: string;
  problem_id: string | null;
  lc_number: number;
  heading: string;
  solved_on: string;
  created_at: string;
};

type ProgressForm = {
  problem_id: string;
  lc_number: string;
  heading: string;
  solved_on: string;
};

type CustomFilter = {
  id: string;
  label: string;
  days: number;
};

type ActiveFilter = "ALL" | string;

const defaultFilters: CustomFilter[] = [
  { id: "days-5", label: "Solved 5 days ago", days: 5 },
  { id: "days-7", label: "Solved 7 days ago", days: 7 },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function ProgressPage() {
  const [problems, setProblems] = useState<ProblemOption[]>([]);
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [form, setForm] = useState<ProgressForm>({
    problem_id: "",
    lc_number: "",
    heading: "",
    solved_on: today(),
  });
  const [problemSearch, setProblemSearch] = useState("");
  const [customFilters, setCustomFilters] = useState<CustomFilter[]>(defaultFilters);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("ALL");
  const [showSettings, setShowSettings] = useState(false);
  const [showAddProgress, setShowAddProgress] = useState(false);
  const [newFilterDays, setNewFilterDays] = useState("");
  const [newFilterLabel, setNewFilterLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedFilters = window.localStorage.getItem("progress_revision_filters");

    if (!storedFilters) {
      return;
    }

    try {
      const parsed = JSON.parse(storedFilters) as CustomFilter[];
      if (Array.isArray(parsed)) {
        setCustomFilters(parsed);
      }
    } catch {
      window.localStorage.removeItem("progress_revision_filters");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "progress_revision_filters",
      JSON.stringify(customFilters)
    );
  }, [customFilters]);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const response = await fetch("/api/progress");
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error ?? "Unable to load progress tracker");
        }

        setProblems(json.problems ?? []);
        setEntries(json.entries ?? []);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load progress tracker");
      } finally {
        setLoading(false);
      }
    };

    void loadProgress();
  }, []);

  const selectedProblem = useMemo(
    () => problems.find((problem) => problem.id === form.problem_id),
    [form.problem_id, problems]
  );

  const filteredProblems = useMemo(() => {
    const query = problemSearch.trim().toLowerCase();

    if (!query) {
      return problems;
    }

    return problems.filter((problem) => {
      return (
        String(problem.lc_number).includes(query) ||
        problem.title.toLowerCase().includes(query)
      );
    });
  }, [problemSearch, problems]);

  const activeCustomFilter = useMemo(
    () => customFilters.find((filter) => filter.id === activeFilter),
    [activeFilter, customFilters]
  );

  const filteredEntries = useMemo(() => {
    if (!activeCustomFilter) {
      return entries;
    }

    const targetDate = daysAgoDate(activeCustomFilter.days);
    return entries.filter((entry) => entry.solved_on === targetDate);
  }, [activeCustomFilter, entries]);

  const activeFilterLabel = activeCustomFilter?.label ?? "All solved";

  const handleAddFilter = () => {
    const days = Number(newFilterDays);

    if (!Number.isInteger(days) || days <= 0) {
      setMessage("Filter days must be a positive whole number.");
      return;
    }

    const label = newFilterLabel.trim() || `Solved ${days} days ago`;
    const filter: CustomFilter = {
      id: `days-${days}-${Date.now()}`,
      label,
      days,
    };

    setCustomFilters((current) => [...current, filter]);
    setActiveFilter(filter.id);
    setNewFilterDays("");
    setNewFilterLabel("");
    setMessage("Revision filter added.");
  };

  const handleDeleteFilter = (filterId: string) => {
    setCustomFilters((current) => current.filter((filter) => filter.id !== filterId));
    if (activeFilter === filterId) {
      setActiveFilter("ALL");
    }
  };

  const handleSelectProblem = (problem: ProblemOption) => {
    setForm((current) => ({
      ...current,
      problem_id: problem.id,
      lc_number: String(problem.lc_number),
      heading: problem.title,
    }));
  };

  const clearSelectedProblem = () => {
    setForm((current) => ({
      ...current,
      problem_id: "",
      lc_number: "",
      heading: "",
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Unable to save progress");
      }

      setEntries((current) => [json.entry, ...current]);
      setForm({ problem_id: "", lc_number: "", heading: "", solved_on: form.solved_on });
      setShowAddProgress(false);
      setMessage("Progress saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save progress");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg px-4 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-medium text-primary hover:underline">
              Back to Home
            </Link>
            <h1 className="mt-2 text-3xl font-semibold text-textPrimary">Progress Tracker</h1>
            <p className="mt-1 text-sm text-textSecondary">
              Track what you solved and configure revision filters.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowSettings((current) => !current)}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-textPrimary transition hover:border-primary hover:text-primary"
            >
              ⚙ Settings
            </button>
            <button
              type="button"
              onClick={() => setShowAddProgress((current) => !current)}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primaryHover"
            >
              {showAddProgress ? "Close Add Progress" : "Add Progress"}
            </button>
          </div>
        </div>

        {message && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
            {message}
          </div>
        )}

        {showSettings && (
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-textPrimary">Revision filter settings</h2>
              <p className="mt-1 text-sm text-textSecondary">
                Create filters like solved 3 days ago, 14 days ago, or any cadence you want.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
              <input
                value={newFilterLabel}
                onChange={(event) => setNewFilterLabel(event.target.value)}
                className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Label, e.g. Week-old revision"
              />
              <input
                value={newFilterDays}
                onChange={(event) => setNewFilterDays(event.target.value)}
                className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Days ago"
              />
              <button
                type="button"
                onClick={handleAddFilter}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primaryHover"
              >
                Add Filter
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {customFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-textPrimary"
                >
                  <span>{filter.label}</span>
                  <span className="text-xs text-textSecondary">{filter.days}d</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteFilter(filter.id)}
                    className="text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-textPrimary">Progress list</h2>
              <p className="mt-1 text-sm text-textSecondary">
                Use the revision filters to revisit problems solved earlier.
              </p>
            </div>
            <div className="rounded-2xl bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
              {filteredEntries.length} shown / {entries.length} tracked
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter("ALL")}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeFilter === "ALL"
                  ? "border-primary bg-primary text-white"
                  : "border-gray-300 bg-white text-textPrimary hover:border-primary hover:text-primary"
              }`}
            >
              All solved
            </button>
            {customFilters.map((filter) => {
              const isActive = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "border-primary bg-primary text-white"
                      : "border-gray-300 bg-white text-textPrimary hover:border-primary hover:text-primary"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <p className="text-sm text-textSecondary">Loading progress...</p>
          ) : entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-textSecondary">
              No progress entries yet. Add the first solved problem below.
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-textSecondary">
              No entries for "{activeFilterLabel}".
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-textPrimary">
                    {entry.lc_number}. {entry.heading}
                  </p>
                  <p className="mt-2 text-xs text-textSecondary">
                    Solved on {new Date(entry.solved_on).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {showAddProgress && (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-textPrimary">Add solved problem</h2>
                <p className="mt-1 text-sm text-textSecondary">
                  Select a problem from the pane or enter details manually.
                </p>
              </div>

              {selectedProblem ? (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Selected problem
                  </p>
                  <p className="mt-2 text-sm font-semibold text-textPrimary">
                    {selectedProblem.lc_number}. {selectedProblem.title}
                  </p>
                  <button
                    type="button"
                    onClick={clearSelectedProblem}
                    className="mt-3 text-sm font-medium text-primary hover:underline"
                  >
                    Clear selection and enter manually
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-textSecondary">
                  No problem selected. Pick one from the problem pane or type manually.
                </div>
              )}

              <label className="block space-y-2">
                <span className="text-sm font-medium text-textPrimary">LC Number</span>
                <input
                  value={form.lc_number}
                  onChange={(event) => setForm({ ...form, problem_id: "", lc_number: event.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Ex. 3"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-textPrimary">Heading</span>
                <input
                  value={form.heading}
                  onChange={(event) => setForm({ ...form, problem_id: "", heading: event.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Ex. Longest Substring Without Repeating Characters"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-textPrimary">Solved Date</span>
                <input
                  type="date"
                  value={form.solved_on}
                  onChange={(event) => setForm({ ...form, solved_on: event.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>

              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primaryHover disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Progress"}
              </button>
            </div>

            <aside className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-textPrimary">Problem bank</h2>
                <p className="mt-1 text-sm text-textSecondary">
                  Search and click a problem to add it to the form.
                </p>
              </div>

              <input
                value={problemSearch}
                onChange={(event) => setProblemSearch(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Search by LC number or heading"
              />

              <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                {filteredProblems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-textSecondary">
                    No problems match your search.
                  </div>
                ) : (
                  filteredProblems.map((problem) => {
                    const isSelected = problem.id === form.problem_id;

                    return (
                      <button
                        key={problem.id}
                        type="button"
                        onClick={() => handleSelectProblem(problem)}
                        className={`w-full rounded-2xl border p-4 text-left transition hover:border-primary hover:bg-primary/5 ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <p className="text-sm font-semibold text-textPrimary">
                          {problem.lc_number}. {problem.title}
                        </p>
                        <p className="mt-1 text-xs text-textSecondary">
                          Click to use this problem
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}
