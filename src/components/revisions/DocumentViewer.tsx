import type { JSONContent } from "@tiptap/react";
import { Fragment, type CSSProperties, type ReactNode } from "react";

import HighlightedCodeBlock from "./HighlightedCodeBlock";

type DocumentViewerProps = {
  title: string;
  linkedProblem: string;
  summary: string;
  contentJson: JSONContent;
  codeSample: string;
  language: string;
};

type RevisionNode = JSONContent & {
  marks?: Array<{
    type: string;
    attrs?: {
      fontSize?: string;
    };
  }>;
  text?: string;
  content?: RevisionNode[];
};

function applyMarks(textNode: RevisionNode, baseContent: ReactNode): ReactNode {
  return (textNode.marks ?? []).reduce<ReactNode>((content, mark, index) => {
    const key = `${mark.type}-${index}`;

    if (mark.type === "bold") {
      return <strong key={key}>{content}</strong>;
    }

    if (mark.type === "code") {
      return <code key={key}>{content}</code>;
    }

    if (mark.type === "textStyle") {
      const style: CSSProperties = {};

      if (mark.attrs?.fontSize) {
        style.fontSize = mark.attrs.fontSize;
      }

      return (
        <span key={key} style={style}>
          {content}
        </span>
      );
    }

    return <Fragment key={key}>{content}</Fragment>;
  }, baseContent);
}

function renderNodes(nodes: RevisionNode[], fallbackLanguage: string, keyPrefix = "node"): ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;

    if (node.type === "text") {
      return applyMarks(node, node.text ?? "");
    }

    if (node.type === "paragraph") {
      return <p key={key}>{renderChildren(node, fallbackLanguage, key)}</p>;
    }

    if (node.type === "heading") {
      if (node.attrs?.level === 2) {
        return <h2 key={key}>{renderChildren(node, fallbackLanguage, key)}</h2>;
      }

      return <h3 key={key}>{renderChildren(node, fallbackLanguage, key)}</h3>;
    }

    if (node.type === "bulletList") {
      return <ul key={key}>{renderChildren(node, fallbackLanguage, key)}</ul>;
    }

    if (node.type === "listItem") {
      return <li key={key}>{renderChildren(node, fallbackLanguage, key)}</li>;
    }

    if (node.type === "codeBlock") {
      const codeText = collectText(node);
      const blockLanguage = node.attrs?.language ?? fallbackLanguage;

      return (
        <HighlightedCodeBlock
          key={key}
          code={codeText}
          language={blockLanguage}
        />
      );
    }

    return <Fragment key={key}>{renderChildren(node, fallbackLanguage, key)}</Fragment>;
  });
}

function renderChildren(node: RevisionNode, fallbackLanguage: string, keyPrefix: string): ReactNode[] {
  return renderNodes(node.content ?? [], fallbackLanguage, `${keyPrefix}-child`);
}

function collectText(node: RevisionNode): string {
  if (node.type === "text") {
    return node.text ?? "";
  }

  return (node.content ?? []).map(collectText).join("");
}

export default function DocumentViewer({
  title,
  linkedProblem,
  summary,
  contentJson,
  codeSample,
  language,
}: DocumentViewerProps) {
  const renderedContent = renderNodes(
    (contentJson.content as RevisionNode[] | undefined) ?? [],
    language
  );

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-textSecondary">
              Document Viewer
            </p>
            <h2 className="mt-2 text-xl font-semibold text-textPrimary">
              {title || "Untitled revision"}
            </h2>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-700">
            Preview
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-textSecondary">
            Linked Problem
          </p>
          <p className="text-sm font-medium text-textPrimary">
            {linkedProblem || "No problem linked yet"}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-textPrimary">Summary</h3>
          <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700">
            {summary || "Your quick revision summary will appear here."}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-textPrimary">Writeup</h3>
          <div className="revision-viewer rounded-2xl border border-gray-100 bg-white px-1">
            {renderedContent.length > 0 ? (
              renderedContent
            ) : (
              <p className="text-sm leading-7 text-gray-500">
                The explanation preview will appear here as you write.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-textPrimary">
              Code Sample
            </h3>
            <span className="rounded-full bg-slate-900 px-3 py-1 font-mono text-xs text-slate-100">
              {language}
            </span>
          </div>

          <HighlightedCodeBlock
            code={codeSample || "// Your code snippet preview will appear here."}
            language={language}
          />
        </div>
      </div>
    </aside>
  );
}
