"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createNotebook, listNotebooks } from "../actions";
import { Plus, FileText, Trash2 } from "lucide-react";
import type { Notebook } from "@/modules/notebook/types";

export function NotebookList() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    listNotebooks().then(setNotebooks);
  }, []);

  const handleCreate = async () => {
    const name = prompt("Notebook name:");
    if (!name) return;
    const nb = await createNotebook(name);
    setNotebooks((prev) => [...prev, nb]);
    router.push(`/notebooks/${nb.id}`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-3">
        <button
          onClick={handleCreate}
          className="w-full h-10 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-sm transition-colors"
        >
          <Plus size={16} />
          New notebook
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
        {notebooks.map((nb) => (
          <button
            key={nb.id}
            onClick={() => router.push(`/notebooks/${nb.id}`)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left rounded transition-colors ${
              params?.notebookId === nb.id
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <FileText size={15} className="shrink-0" />
            <span className="truncate">{nb.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
