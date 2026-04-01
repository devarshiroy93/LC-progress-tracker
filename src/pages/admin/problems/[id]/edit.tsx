import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type ProblemForm = {
  lc_number: string;
  title: string;
  statement: string;
  example_input: string;
  example_output: string;
  example_explanation: string;
};

const emptyForm: ProblemForm = {
  lc_number: "",
  title: "",
  statement: "",
  example_input: "",
  example_output: "",
  example_explanation: "",
};

export default function EditProblemPage() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState<ProblemForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== "string") {
      return;
    }

    const loadProblem = async () => {
      try {
        const response = await fetch(`/api/admin/problems/${id}`);
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error ?? "Failed to load problem");
        }

        setForm({
          lc_number: String(json.problem.lc_number),
          title: json.problem.title,
          statement: json.problem.statement,
          example_input: json.problem.example_input,
          example_output: json.problem.example_output,
          example_explanation: json.problem.example_explanation,
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load problem");
      } finally {
        setLoading(false);
      }
    };

    void loadProblem();
  }, [id]);

  const handleSave = async () => {
    if (!id || typeof id !== "string") {
      return;
    }

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/problems/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          lc_number: Number(form.lc_number),
        }),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Unable to update problem");
      }

      setMessage("Problem updated successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update problem");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main className="min-h-screen bg-bg px-4 py-8 text-sm text-textSecondary">Loading problem...</main>;
  }

  if (error && !form.title) {
    return <main className="min-h-screen bg-bg px-4 py-8 text-sm text-red-600">{error}</main>;
  }

  return (
    <main className="min-h-screen bg-bg px-4 py-8">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div>
          <Link href="/admin/problems" className="text-sm font-medium text-primary hover:underline">
            Back to Problem List
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-textPrimary">Edit Problem</h1>
          <p className="mt-1 text-sm text-textSecondary">Update any part of the problem details and save when you are ready.</p>
        </div>

        {message && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <Input label="LeetCode Number" value={form.lc_number} onChange={(value) => setForm({ ...form, lc_number: value })} />
          <Input label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
          <Textarea label="Statement" rows={5} value={form.statement} onChange={(value) => setForm({ ...form, statement: value })} />
          <Textarea label="Example Input" value={form.example_input} onChange={(value) => setForm({ ...form, example_input: value })} />
          <Textarea label="Example Output" value={form.example_output} onChange={(value) => setForm({ ...form, example_output: value })} />
          <Textarea label="Example Explanation" value={form.example_explanation} onChange={(value) => setForm({ ...form, example_explanation: value })} />

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="w-full py-3 rounded-lg font-medium text-white bg-primary hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </section>
      </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-textPrimary">{label}</label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-textPrimary">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
    </div>
  );
}
