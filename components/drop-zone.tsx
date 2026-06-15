"use client";

import { useState, useRef, type DragEvent } from "react";
import { Upload } from "lucide-react";

interface DropZoneProps {
  onFiles: (files: File[]) => void;
}

const VALID_EXTS = ".pdf,.docx,.txt,.csv,.md,.html,.htm,.xlsx,.xls";

export function DropZone({ onFiles }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) onFiles(Array.from(files));
  };

  const handleClick = () => inputRef.current?.click();

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`flex-1 flex items-center justify-center p-8 cursor-pointer transition-all duration-200 ${
        dragging ? "bg-surface-elevated/50" : ""
      }`}
    >
      <div className={`text-center max-w-lg mx-auto transition-transform duration-200 ${
        dragging ? "scale-105" : ""
      }`}>
        <div className={`w-20 h-20 mx-auto mb-6 border-2 border-dashed flex items-center justify-center transition-colors ${
          dragging ? "border-accent-brand bg-accent-brand/5" : "border-surface-border bg-surface-card"
        }`}>
          <Upload size={32} className={dragging ? "text-accent-brand" : "text-text-muted"} />
        </div>
        <h2 className="text-xl font-bold text-text-outlined mb-2">Add sources to get started</h2>
        <p className="text-sm text-text-muted mb-8 leading-relaxed">
          Upload documents, add web pages, or paste YouTube links to build your knowledge base.
          Once your sources are ready, you can ask questions and generate summaries.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <span className="flex items-center justify-center gap-2 h-12 px-6 bg-surface-card hover:bg-surface-elevated text-sm transition-colors cursor-pointer border border-surface-border">
            <Upload size={16} />
            Drop files here or click to browse
          </span>
        </div>
        <p className="text-xs text-text-faint mt-6">Supports PDF, DOCX, TXT, CSV, MD, HTML, XLSX, web pages, and YouTube</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept={VALID_EXTS}
        multiple
      />
    </div>
  );
}
