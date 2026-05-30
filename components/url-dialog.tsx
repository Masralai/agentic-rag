"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Plus, Link } from "lucide-react";

interface UrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (url: string) => void;
}

export function UrlDialog({ open, onOpenChange, onConfirm }: UrlDialogProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!url.trim()) return;
    setLoading(true);
    await onConfirm(url.trim());
    setLoading(false);
    setUrl("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-subtle border-surface-border text-white">
        <DialogHeader>
          <DialogTitle className="text-sm text-text-outlined">Add URL</DialogTitle>
          <DialogDescription className="text-xs text-text-muted mt-2">
            Enter a web page URL or YouTube link to add as a source.
          </DialogDescription>
        </DialogHeader>
        <div className="relative mt-2">
          <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            placeholder="https://example.com"
            className="w-full h-10 bg-surface-card border border-surface-border pl-9 pr-3 text-sm outline-none focus:border-accent-brand transition-colors text-text-outlined"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <DialogClose className="h-9 px-4 text-xs bg-surface-card hover:bg-surface-elevated transition-colors text-text-muted">
            Cancel
          </DialogClose>
          <button
            onClick={handleSubmit}
            disabled={loading || !url.trim()}
            className="h-9 px-4 text-xs bg-accent-brand text-black hover:bg-accent-brand/90 disabled:opacity-30 transition-colors flex items-center gap-2"
          >
            <Plus size={14} />
            {loading ? "Adding..." : "Add URL"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
