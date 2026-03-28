import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { TextStyle } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import {
  EditorContent,
  useEditor,
  type Editor,
  type JSONContent,
} from "@tiptap/react";

import { lowlight } from "@/lib/lowlight";

import FontSize from "./extensions/FontSize";
import HighlightedCodeBlock from "./HighlightedCodeBlock";

type RevisionBodyProps = {
  summary: string;
  codeSample: string;
  language: string;
  initialContent: JSONContent;
  onSummaryChange: (value: string) => void;
  onDocumentChange: (document: { json: JSONContent; html: string }) => void;
  onCodeSampleChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
};

const fontSizes = [
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "22px", value: "22px" },
];

type ActionButtonProps = {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
};

function ActionButton({
  active = false,
  disabled = false,
  label,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-primary bg-primary text-white"
          : "border-gray-200 bg-gray-50 text-textSecondary hover:border-primary hover:text-primary"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {label}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  const currentFontSize =
    editor?.getAttributes("textStyle").fontSize?.toString() ?? "";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50/70 p-3">
      <ActionButton
        label="Bold"
        active={editor?.isActive("bold")}
        disabled={!editor}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      />
      <ActionButton
        label="H2"
        active={editor?.isActive("heading", { level: 2 })}
        disabled={!editor}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ActionButton
        label="Bullets"
        active={editor?.isActive("bulletList")}
        disabled={!editor}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
      />
      <ActionButton
        label="Inline Code"
        active={editor?.isActive("code")}
        disabled={!editor}
        onClick={() => editor?.chain().focus().toggleCode().run()}
      />
      <ActionButton
        label="Code Block"
        active={editor?.isActive("codeBlock")}
        disabled={!editor}
        onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
      />

      <label className="ml-auto flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-textSecondary">
        Font Size
        <select
          value={currentFontSize}
          onChange={(event) => {
            const value = event.target.value;

            if (!editor) {
              return;
            }

            if (value) {
              editor.chain().focus().setFontSize(value).run();
              return;
            }

            editor.chain().focus().unsetFontSize().run();
          }}
          className="bg-transparent text-xs text-textPrimary outline-none"
        >
          <option value="">Default</option>
          {fontSizes.map((fontSize) => (
            <option key={fontSize.value} value={fontSize.value}>
              {fontSize.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default function RevisionBody({
  summary,
  codeSample,
  language,
  initialContent,
  onSummaryChange,
  onDocumentChange,
  onCodeSampleChange,
  onLanguageChange,
}: RevisionBodyProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      TextStyle,
      FontSize,
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
    onCreate: ({ editor: currentEditor }) => {
      onDocumentChange({
        json: currentEditor.getJSON(),
        html: currentEditor.getHTML(),
      });
    },
    onUpdate: ({ editor: currentEditor }) => {
      onDocumentChange({
        json: currentEditor.getJSON(),
        html: currentEditor.getHTML(),
      });
    },
  });

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-6">
        <Toolbar editor={editor} />

        <label className="block space-y-2">
          <span className="text-sm font-medium text-textPrimary">Summary</span>
          <textarea
            rows={3}
            value={summary}
            onChange={(event) => onSummaryChange(event.target.value)}
            placeholder="Capture the idea in 2-3 lines so future-you can revise fast."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-textPrimary">
            Writeup Body
          </span>
          <div className="rounded-2xl border border-gray-300 bg-white px-4 py-4 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <EditorContent
              editor={editor}
              className="revision-editor min-h-[360px]"
            />
          </div>
        </label>

        <div className="grid gap-4 md:grid-cols-[160px_minmax(0,1fr)]">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-textPrimary">
              Language
            </span>
            <select
              value={language}
              onChange={(event) => onLanguageChange(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </label>

          <div className="space-y-2">
            <span className="text-sm font-medium text-textPrimary">
              Code Sample
            </span>
            <div className="relative overflow-hidden rounded-2xl border border-gray-300 bg-slate-950 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <HighlightedCodeBlock
                code={codeSample || "// Start writing your code sample here."}
                language={language}
                className="min-h-[320px] rounded-none border-0"
              />
              <textarea
                value={codeSample}
                onChange={(event) => onCodeSampleChange(event.target.value)}
                spellCheck={false}
                className="revision-code-input absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-4 font-mono text-sm leading-6 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
