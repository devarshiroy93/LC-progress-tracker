import { Fragment, type ReactNode } from "react";

import { lowlight } from "@/lib/lowlight";

type HighlightNode = {
  type: string;
  value?: string;
  properties?: {
    className?: string[];
  };
  children?: HighlightNode[];
};

type HighlightedCodeBlockProps = {
  code: string;
  language: string;
  className?: string;
};

function renderNodes(nodes: HighlightNode[], keyPrefix = "node"): ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;

    if (node.type === "text") {
      return <Fragment key={key}>{node.value}</Fragment>;
    }

    const className = node.properties?.className?.join(" ");

    return (
      <span key={key} className={className}>
        {renderNodes(node.children ?? [], key)}
      </span>
    );
  });
}

export default function HighlightedCodeBlock({
  code,
  language,
  className = "",
}: HighlightedCodeBlockProps) {
  const normalizedLanguage = lowlight.registered(language)
    ? language
    : "javascript";
  const highlighted = lowlight.highlight(normalizedLanguage, code);

  return (
    <pre
      className={`revision-code-block overflow-x-auto rounded-2xl p-4 text-sm leading-6 ${className}`.trim()}
    >
      <code className={`hljs language-${normalizedLanguage}`}>
        {renderNodes((highlighted.children as HighlightNode[]) ?? [])}
      </code>
    </pre>
  );
}
