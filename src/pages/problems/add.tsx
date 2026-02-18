import { useState } from "react";

type SingleForm = {
  lc_number: string;
  title: string;
  statement: string;
  example_input: string;
  example_output: string;
  example_explanation: string;
};

export default function AddProblemsPage() {
  const [mode, setMode] = useState<"SINGLE" | "BULK">("SINGLE");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  /* ------------------
   * SINGLE MODE STATE
   * ------------------ */
  const [singleForm, setSingleForm] = useState<SingleForm>({
    lc_number: "",
    title: "",
    statement: "",
    example_input: "",
    example_output: "",
    example_explanation: "",
  });

  /* ------------------
   * BULK MODE STATE
   * ------------------ */
  const [bulkJson, setBulkJson] = useState("");

  /* ------------------
   * SINGLE SUBMIT
   * ------------------ */
  const saveSingleProblem = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/problems/add-single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...singleForm,
          lc_number: Number(singleForm.lc_number),
        }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error);

      setMessage("✅ Problem added successfully");
      setSingleForm({
        lc_number: "",
        title: "",
        statement: "",
        example_input: "",
        example_output: "",
        example_explanation: "",
      });
    } catch (err: unknown) {
      setMessage(`❌ ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------
   * BULK SUBMIT
   * ------------------ */
  const insertBulkProblems = async () => {
    setLoading(true);
    setMessage(null);

    let parsed;
    try {
      parsed = JSON.parse(bulkJson);
    } catch {
      setMessage("❌ Invalid JSON");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/problems/add-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problems: parsed }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error);

      setMessage(`✅ Inserted ${json.insertedCount} problems`);
      setBulkJson("");
    } catch (err: unknown) {
      setMessage(`❌ ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-textPrimary">
            Add Problems
          </h1>
          <p className="text-sm text-textSecondary">
            Add LeetCode problems individually or in bulk
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2">
          {["SINGLE", "BULK"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m as unknown as "SINGLE" | "BULK")}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                mode === m
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-textPrimary border-gray-300 hover:bg-gray-50"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {message && (
          <div className="text-sm text-textSecondary">{message}</div>
        )}

        {/* SINGLE MODE */}
        {mode === "SINGLE" && (
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
            <h2 className="text-lg font-semibold text-textPrimary">
              Add Single Problem
            </h2>

            <Input
              label="LeetCode Number"
              value={singleForm.lc_number}
              onChange={(v) =>
                setSingleForm({ ...singleForm, lc_number: v })
              }
            />
            <Input
              label="Title"
              value={singleForm.title}
              onChange={(v) =>
                setSingleForm({ ...singleForm, title: v })
              }
            />

            <Textarea
              label="Statement"
              rows={4}
              value={singleForm.statement}
              onChange={(v) =>
                setSingleForm({ ...singleForm, statement: v })
              }
            />

            <Textarea
              label="Example Input"
              value={singleForm.example_input}
              onChange={(v) =>
                setSingleForm({ ...singleForm, example_input: v })
              }
            />

            <Textarea
              label="Example Output"
              value={singleForm.example_output}
              onChange={(v) =>
                setSingleForm({ ...singleForm, example_output: v })
              }
            />

            <Textarea
              label="Example Explanation"
              value={singleForm.example_explanation}
              onChange={(v) =>
                setSingleForm({
                  ...singleForm,
                  example_explanation: v,
                })
              }
            />

            <button
              disabled={loading}
              onClick={saveSingleProblem}
              className="w-full py-2 rounded-lg font-medium text-white bg-primary hover:opacity-90 disabled:opacity-50"
            >
              Save Problem
            </button>
          </section>
        )}

        {/* BULK MODE */}
        {mode === "BULK" && (
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
            <h2 className="text-lg font-semibold text-textPrimary">
              Add Problems in Bulk
            </h2>

            <Textarea
              label="Problems JSON"
              rows={10}
              mono
              value={bulkJson}
              onChange={setBulkJson}
            />

            <button
              disabled={loading}
              onClick={insertBulkProblems}
              className="w-full py-2 rounded-lg font-medium text-white bg-primary hover:opacity-90 disabled:opacity-50"
            >
              Insert Problems
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

/* ------------------
 * Reusable Inputs
 * ------------------ */

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-textPrimary">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-textPrimary">
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm ${
          mono ? "font-mono text-xs" : ""
        }`}
      />
    </div>
  );
}
