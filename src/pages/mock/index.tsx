import { useState } from "react";
import Timer from "../../components/timer";

const problems = [
  {
    number: 76,
    title: "Minimum Window Substring",
    statement:
      "Given two strings s and t, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.",
    example: {
      input: 's = "ADOBECODEBANC", t = "ABC"',
      output: '"BANC"',
      explanation:
        "The substring \"BANC\" contains all characters 'A', 'B', and 'C' with the minimum possible length.",
    },
  },
  {
    number: 438,
    title: "Find All Anagrams in a String",
    statement:
      "Given two strings s and p, return all the start indices of p's anagrams in s.",
    example: {
      input: 's = "cbaebabacd", p = "abc"',
      output: "[0, 6]",
      explanation:
        "The substrings starting at indices 0 (\"cba\") and 6 (\"bac\") are anagrams of \"abc\".",
    },
  },
];

export default function Mock() {
  const [index, setIndex] = useState(0);
  const [showTitle, setShowTitle] = useState(false);

  const problem = problems[index];
  const total = problems.length;

  const goNext = () => {
    setShowTitle(false);
    setIndex((i) => (i + 1) % total);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">

        {/* Top Row */}
        <div className="flex items-center justify-between text-sm text-textSecondary font-medium">
          <span>LeetCode #{problem.number}</span>
          <span>{index + 1} / {total}</span>
          <Timer key={index} />
        </div>

        {/* Statement */}
        <p className="text-sm text-textPrimary leading-relaxed">
          {problem.statement}
        </p>

        {/* Example */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm space-y-1">
          <div>
            <span className="font-medium">Input:</span> {problem.example.input}
          </div>
          <div>
            <span className="font-medium">Output:</span> {problem.example.output}
          </div>
          <div className="text-textSecondary text-xs">
            {problem.example.explanation}
          </div>
        </div>

        {/* Title Reveal */}
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

        {/* Actions */}
        <div className="flex gap-4 pt-2">
          <button
            onClick={goNext}
            className="flex-1 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition"
          >
            Solved
          </button>

          <button
            onClick={goNext}
            className="flex-1 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition"
          >
            Not Solved
          </button>
        </div>
      </div>
    </div>
  );
}
