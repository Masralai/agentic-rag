"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import type { Source } from "@/modules/node/types";
import { SourceIcon } from "./source-icon";
import { Progress } from "./ui/progress";
import { EmptyState } from "./empty-state";

interface SourceListProps {
  sources: Source[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  previewSourceId: string | null;
  onPreview: (s: Source) => void;
  onRemove: (id: string) => void;
  onToggleEnabled?: (id: string, enabled: boolean) => void;
}

export function SourceList({
  sources,
  searchQuery,
  onSearchChange,
  previewSourceId,
  onPreview,
  onRemove,
  onToggleEnabled,
}: SourceListProps) {
  return (
    <>
      <div className="px-3 pt-3 pb-1">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter sources..."
            className="w-full h-8 bg-surface-card border border-surface-border pl-7 pr-3 text-xs outline-none focus:border-accent-brand transition-colors text-text-outlined"
            aria-label="Filter sources"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 pt-1 space-y-1">
        <p className="text-xs text-text-muted px-2 pb-2 font-medium">
          SOURCES
          {searchQuery && (
            <span className="text-text-faint font-normal">
              {" "}({sources.length})
            </span>
          )}
        </p>
        {sources.length === 0 ? (
          <EmptyState
            variant={searchQuery ? undefined : "no-sources"}
            title={searchQuery ? "No sources match your filter" : undefined}
            description={searchQuery ? "Try a different search term." : undefined}
            className="px-2 py-8"
          />
        ) : (
          sources.map((src, i) => (
            <motion.div
              key={src.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03, ease: "easeOut" }}
              layout
              onClick={() => onPreview(src)}
              className={`group flex flex-col px-3 py-2.5 transition-colors cursor-pointer ${
                previewSourceId === src.id ? "bg-surface-elevated" : "hover:bg-surface-card"
              } ${src.enabled === false ? "opacity-50" : ""}`}
            >
              <div className="flex items-center gap-3">
                {onToggleEnabled && (
                  <input
                    type="checkbox"
                    checked={src.enabled !== false}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggleEnabled(src.id, e.target.checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="accent-emerald-500 shrink-0"
                    aria-label={`${src.enabled === false ? "Enable" : "Disable"} ${src.name}`}
                  />
                )}
                <SourceIcon type={src.type} size={14} />
                <span className="text-xs truncate flex-1 text-text-muted">{src.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 shrink-0 ${
                  src.status === "ready" ? "bg-emerald-900/50 text-emerald-400" :
                  src.status === "failed" ? "bg-red-900/50 text-red-400" :
                  "bg-surface-elevated text-text-muted"
                }`}>
                  {src.status === "processing" || src.status === "pending" ? "..." : src.status}
                </span>
                {src.status !== "processing" && src.status !== "pending" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(src.id); }}
                    className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition-all shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={`Remove ${src.name}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 3l8 8M11 3l-8 8" />
                    </svg>
                  </button>
                )}
              </div>
              {(src.status === "processing" || src.status === "pending") && (
                <Progress
                  indeterminate={!src.progress}
                  value={src.progress?.current}
                  max={src.progress?.total}
                  label={src.progress?.phase}
                />
              )}
            </motion.div>
          ))
        )}
      </div>
    </>
  );
}

export function MobileSourcesPanel({
  sources,
  previewSourceId,
  onPreview,
  onRemove,
  onToggleEnabled,
}: SourceListProps) {
  return (
    <div className="max-h-48 overflow-y-auto border border-surface-border p-2 space-y-1">
      {sources.length === 0 ? (
        <p className="text-xs text-text-faint px-2 py-4 text-center">No sources yet</p>
      ) : (
        sources.map((src) => (
          <div
            key={src.id}
            onClick={() => onPreview(src)}
            className={`group flex items-center gap-3 px-3 py-2 transition-colors cursor-pointer ${
              previewSourceId === src.id ? "bg-surface-elevated" : "hover:bg-surface-card"
            } ${src.enabled === false ? "opacity-50" : ""}`}
          >
            {onToggleEnabled && (
              <input
                type="checkbox"
                checked={src.enabled !== false}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleEnabled(src.id, e.target.checked);
                }}
                onClick={(e) => e.stopPropagation()}
                className="accent-emerald-500 shrink-0"
                aria-label={`${src.enabled === false ? "Enable" : "Disable"} ${src.name}`}
              />
            )}
            <SourceIcon type={src.type} size={14} />
            <span className="text-xs truncate flex-1 text-text-muted">{src.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 ${
              src.status === "ready" ? "bg-emerald-900/50 text-emerald-400" :
              src.status === "failed" ? "bg-red-900/50 text-red-400" :
              "bg-surface-elevated text-text-muted"
            }`}>
              {src.status === "processing" || src.status === "pending" ? "..." : src.status}
            </span>
            {src.status !== "processing" && src.status !== "pending" && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(src.id); }}
                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition-all shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={`Remove ${src.name}`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3l8 8M11 3l-8 8" />
                </svg>
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
