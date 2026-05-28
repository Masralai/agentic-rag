"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createNode, listNodes } from "../actions";
import { Plus, FileText, Trash2 } from "lucide-react";
import type { Node } from "@/modules/node/types";

export function NodeList() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    listNodes().then(setNodes);
  }, []);

  const handleCreate = async () => {
    const name = prompt("Node name:");
    if (!name) return;
    const nb = await createNode(name);
    setNodes((prev) => [...prev, nb]);
    router.push(`/nodes/${nb.id}`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-3">
        <button
          onClick={handleCreate}
          className="w-full h-10 flex items-center justify-center gap-2 bg-surface-card hover:bg-surface-elevated text-sm transition-colors"
        >
          <Plus size={16} />
          New node
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {nodes.map((nb) => (
          <button
            key={nb.id}
            onClick={() => router.push(`/nodes/${nb.id}`)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${
              params?.nodeId === nb.id
                ? "bg-surface-elevated text-white"
                : "text-text-muted hover:text-white hover:bg-surface-card"
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
