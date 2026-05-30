"use client";

import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import type { Source } from "@/modules/node/types";
import { SourceIcon } from "./source-icon";

interface SourceListProps {
  sources: Source[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  previewSourceId: string | null;
  onPreview: (s: Source) => void;
  onRemove: (id: string) => void;
}

function ProgressBar({ current, total, phase }: { current: number; total: number; phase: string }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const determinate = total > 0;

  return (
    <div className="mt-2 space-y-1">
      <div className="h-[3px] bg-surface-border overflow-hidden">
        <div
          className={`h-full bg-accent-brand transition-all duration-500 ${
            determinate ? "" : "w-1/3 animate-pulse"
          }`}
          style={determinate ? { width: `${pct}%` } : {}}
        />
      </div>
      <p className="text-[10px] text-text-muted">{phase}</p>
    </div>
  );
}

export function SourceList({
  sources,
  searchQuery,
  onSearchChange,
  previewSourceId,
  onPreview,
  onRemove,
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
        {sources.length === 0 && (
          <p className="text-xs text-text-faint px-2">
            {searchQuery ? "No sources match your filter" : "No sources yet"}
          </p>
        )}
        {sources.map((src) => (
          <div
            key={src.id}
            onClick={() => onPreview(src)}
            className={`group flex flex-col px-3 py-2.5 transition-colors cursor-pointer ${
              previewSourceId === src.id ? "bg-surface-elevated" : "hover:bg-surface-card"
            }`}
          >
            <div className="flex items-center gap-3">
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
                  className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition-all shrink-0"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {(src.status === "processing" || src.status === "pending") && src.progress && (
              <ProgressBar
                current={src.progress.current}
                total={src.progress.total}
                phase={src.progress.phase}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export function MobileSourcesPanel({
  sources,
  previewSourceId,
  searchQuery,
  onSearchChange,
  onPreview,
  onRemove,
}: SourceListProps) {
  return (
    <div className="max-h-48 overflow-y-auto border border-surface-border p-2 space-y-1">
      {sources.length === 0 && (
        <p className="text-xs text-text-faint px-2 py-4 text-center">No sources yet</p>
      )}
      {sources.map((src) => (
        <div
          key={src.id}
          onClick={() => onPreview(src)}
          className={`group flex items-center gap-3 px-3 py-2 transition-colors cursor-pointer ${
            previewSourceId === src.id ? "bg-surface-elevated" : "hover:bg-surface-card"
          }`}
        >
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
              className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition-all shrink-0"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
