"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Citation } from "@/modules/node/types";

function renderWithCitations(
  text: string,
  onCite?: (n: number) => void,
): React.ReactNode[] {
  const parts = text.split(/(\[\d+\])/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[(\d+)\]$/);
    if (m) {
      const n = Number(m[1]);
      return (
        <button
          key={i}
          type="button"
          onClick={() => onCite?.(n)}
          className="citation-chip align-super text-[10px] text-emerald-400 hover:text-emerald-300 mx-0.5"
          aria-label={`Citation ${n}`}
        >
          [{n}]
        </button>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function CitedMarkdown({
  content,
  onCite,
}: {
  content: string;
  onCite?: (n: number) => void;
}) {
  const components: Components = {
    p: ({ children }) => (
      <p>
        {Array.isArray(children)
          ? children.map((child, i) =>
              typeof child === "string" ? <span key={i}>{renderWithCitations(child, onCite)}</span> : child,
            )
          : typeof children === "string"
            ? renderWithCitations(children, onCite)
            : children}
      </p>
    ),
    li: ({ children }) => (
      <li>
        {Array.isArray(children)
          ? children.map((child, i) =>
              typeof child === "string" ? <span key={i}>{renderWithCitations(child, onCite)}</span> : child,
            )
          : typeof children === "string"
            ? renderWithCitations(children, onCite)
            : children}
      </li>
    ),
    text: ({ children }) => <>{typeof children === "string" ? renderWithCitations(children, onCite) : children}</>,
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}

export function SourcesFooter({
  citations,
  onSelect,
}: {
  citations: Citation[];
  onSelect: (c: Citation) => void;
}) {
  if (!citations?.length) return null;
  return (
    <div className="mt-3 pt-3 border-t border-surface-border">
      <p className="text-[10px] uppercase tracking-wide text-text-muted mb-2">Sources used</p>
      <div className="flex flex-wrap gap-2">
        {citations.map((c) => (
          <button
            key={`${c.index}-${c.sourceId}`}
            type="button"
            onClick={() => onSelect(c)}
            className="text-[11px] px-2 py-1 border border-surface-border hover:border-emerald-500/50 text-text-muted hover:text-emerald-400 transition-colors"
          >
            [{c.index}] {c.sourceName}
          </button>
        ))}
      </div>
    </div>
  );
}
