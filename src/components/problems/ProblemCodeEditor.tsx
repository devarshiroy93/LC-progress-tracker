import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { OnMount } from "@monaco-editor/react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

const starterCode = {
  javascript: `function solve() {
  // write your solution here
}`,
  typescript: `function solve(): void {
  // write your solution here
}`,
  python: `def solve():
    # write your solution here
    pass`,
  java: `class Solution {
    public void solve() {
        // write your solution here
    }
}`,
  cpp: `class Solution {
public:
    void solve() {
        // write your solution here
    }
};`,
};

type EditorLanguage = keyof typeof starterCode;

const monacoLanguageMap: Record<EditorLanguage, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  cpp: "cpp",
};

export default function ProblemCodeEditor() {
  const [language, setLanguage] = useState<EditorLanguage>("javascript");
  const [codeByLanguage, setCodeByLanguage] = useState(starterCode);

  const currentCode = codeByLanguage[language];
  const editorLanguage = monacoLanguageMap[language];

  const editorOptions = useMemo(
    () => ({
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily: "Consolas, Monaco, 'Courier New', monospace",
      lineNumbersMinChars: 3,
      roundedSelection: false,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: "on" as const,
      tabSize: 2,
      padding: {
        top: 16,
        bottom: 16,
      },
    }),
    []
  );

  const handleMount: OnMount = (editor, monaco) => {
    monaco.editor.defineTheme("dsa-recall", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#0f172a",
        "editorLineNumber.foreground": "#475569",
        "editorLineNumber.activeForeground": "#e2e8f0",
        "editorLineHighlightBackground": "#172033",
        "editorIndentGuide.background1": "#1e293b",
        "editor.selectionBackground": "#334155",
      },
    });

    monaco.editor.setTheme("dsa-recall");
    editor.focus();
  };

  return (
    <aside className="hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex md:flex-col md:min-h-[720px]">
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-textSecondary">
            Code Editor
          </p>
          <h2 className="mt-2 text-lg font-semibold text-textPrimary">
            Code now
          </h2>
        </div>

        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value as EditorLanguage)}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      <div className="mt-5 flex-1 overflow-hidden rounded-2xl border border-gray-300 bg-slate-950">
        <MonacoEditor
          height="100%"
          defaultLanguage={editorLanguage}
          language={editorLanguage}
          value={currentCode}
          theme="vs-dark"
          onMount={handleMount}
          options={editorOptions}
          onChange={(value) => {
            setCodeByLanguage((current) => ({
              ...current,
              [language]: value ?? "",
            }));
          }}
        />
      </div>
    </aside>
  );
}
