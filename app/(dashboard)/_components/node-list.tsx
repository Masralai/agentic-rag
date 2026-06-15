"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createNode, listNodes, renameNode, deleteNode } from "../actions";
import { Plus, FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { NodeCreateDialog } from "@/components/node-create-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Node } from "@/modules/node/types";

export function NodeList() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    listNodes()
      .then(setNodes)
      .finally(() => setLoading(false));
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (nodes.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, nodes.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < nodes.length) {
          router.push(`/nodes/${nodes[focusedIndex].id}`);
        }
        break;
    }
  };

  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll<HTMLButtonElement>("[data-node-item]");
      items[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  const handleCreate = () => {
    setShowCreateDialog(true);
  };

  const handleCreateConfirm = async (name: string) => {
    const nb = await createNode(name);
    setNodes((prev) => [...prev, nb]);
    router.push(`/nodes/${nb.id}`);
    toast.success("Node created");
  };

  const handleRename = async (node: Node) => {
    const name = prompt("New name:", node.name);
    if (!name || name === node.name) return;
    try {
      await renameNode(node.id, name);
      setNodes((prev) => prev.map((n) => n.id === node.id ? { ...n, name } : n));
      toast.success("Node renamed");
    } catch {
      toast.error("Failed to rename node");
    }
  };

  const handleDelete = async (node: Node) => {
    try {
      await deleteNode(node.id);
      setNodes((prev) => prev.filter((n) => n.id !== node.id));
      toast.success("Node deleted");
    } catch {
      toast.error("Failed to delete node");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden p-3 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[40px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-3">
        <button
          onClick={handleCreate}
          className="w-full h-[40px] flex items-center justify-center gap-2 bg-surface-card hover:bg-surface-elevated text-sm transition-colors active:scale-[0.97]"
          aria-label="Create new node"
        >
          <Plus size={16} />
          New node
        </button>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-3 pb-3 space-y-1"
        onKeyDown={handleKeyDown}
        role="listbox"
        aria-label="Node list"
        tabIndex={0}
      >
        {nodes.length === 0 ? (
          <EmptyState
            variant="no-nodes"
            className="px-2 py-8"
          />
        ) : (
          nodes.map((nb, i) => (
            <div
              key={nb.id}
              className={`group flex items-center gap-1 px-3 py-2 transition-colors cursor-pointer ${
                params?.nodeId === nb.id
                  ? "bg-surface-elevated text-white"
                  : "text-text-muted hover:text-white hover:bg-surface-card"
              }`}
            >
              <button
                data-node-item
                ref={(el) => {
                  if (focusedIndex === i) el?.focus();
                }}
                onClick={() => router.push(`/nodes/${nb.id}`)}
                className="flex items-center gap-3 flex-1 min-w-0 text-sm text-left outline-none focus-visible:outline-1 focus-visible:outline-accent-brand"
                role="option"
                aria-selected={params?.nodeId === nb.id}
                tabIndex={-1}
              >
                <FileText size={15} className="shrink-0" />
                <span className="truncate">{nb.name}</span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center text-text-muted hover:text-white transition-all min-h-[44px] min-w-[44px]"
                    aria-label={`Actions for ${nb.name}`}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleRename(nb)}>
                    <Pencil size={12} />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDelete(nb)} className="hover:text-red-400!">
                    <Trash2 size={12} />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>
      <NodeCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onConfirm={handleCreateConfirm}
      />
    </div>
  );
}
