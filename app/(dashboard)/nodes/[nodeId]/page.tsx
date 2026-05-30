"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { addSource, removeSource, listSources, listMessages, generateSummary, getSourceContent } from "../../actions";
import { FileText, Send, Plus, X, Loader2, BookOpen, HelpCircle, File as FileIcon, Search } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Source, ChatMessage } from "@/modules/node/types";

const fileTypeIcons: Record<string, any> = {
  pdf: FileText,
  docx: FileText,
  txt: FileText,
  web: FileIcon,
  youtube: FileIcon,
};

export default function NodePage() {
  const { nodeId } = useParams() as { nodeId: string };
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSourcesOpen, setMobileSourcesOpen] = useState(false);
  const [previewSourceId, setPreviewSourceId] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sourceToRemove, setSourceToRemove] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    const [srcs, msgs] = await Promise.all([
      listSources(nodeId),
      listMessages(nodeId),
    ]);
    setSources(srcs);
    setMessages(msgs);
  }, [nodeId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView(); }, [messages, streaming]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || streaming) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      nodeId,
      role: "user",
      content: query,
      sources: [],
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId, query: userMsg.content }),
      });

      if (!res.ok) throw new Error("Stream failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), nodeId, role: "assistant", content: "", sources: [], createdAt: new Date() },
      ]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        fullText += text;
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === "assistant") {
            updated[updated.length - 1] = { ...last, content: fullText };
          }
          return updated;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          nodeId,
          role: "assistant",
          content: "Error: failed to get response",
          sources: [],
          createdAt: new Date(),
        },
      ]);
    }

    setStreaming(false);
    fetchData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    const typeMap: Record<string, "pdf" | "docx" | "txt" | "csv" | "md" | "html" | "xlsx"> = {
      pdf: "pdf", docx: "docx", txt: "txt",
      csv: "csv", md: "md", html: "html", htm: "html",
      xlsx: "xlsx", xls: "xlsx",
    };
    const type = typeMap[ext || ""];
    if (!type) { alert("Unsupported file type"); return; }

    const formData = new FormData();
    formData.append("file", file);
    await addSource(nodeId, type, formData);
    fetchData();
  };

  const handleAddUrl = async () => {
    const url = prompt("Enter URL:");
    if (!url) return;
    const type = url.includes("youtube.com") || url.includes("youtu.be") ? "youtube" as const : "web" as const;
    const formData = new FormData();
    formData.append("url", url);
    formData.append("name", url);
    await addSource(nodeId, type, formData);
    fetchData();
  };

  const handleSummary = async (type: "study-guide" | "faq") => {
    setSummaryLoading(true);
    const result = await generateSummary(nodeId, type);
    setSummary(result.content);
    setSummaryLoading(false);
  };

  const handleRemoveSource = async (id: string) => {
    await removeSource(id, nodeId);
    fetchData();
  };

  const handlePreviewSource = async (source: Source) => {
    if (previewSourceId === source.id) {
      setPreviewSourceId(null);
      return;
    }
    setPreviewSourceId(source.id);
    setPreviewText("");
    setPreviewLoading(true);
    const text = await getSourceContent(source.id);
    setPreviewText(text || "No content available");
    setPreviewLoading(false);
  };

  const filteredSources = sources.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  function renderContent(content: string) {
    const processed = content.replace(
      /\[(\d+)\]/g,
      '<sup class="citation">[$1]</sup>',
    );
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {processed}
      </ReactMarkdown>
    );
  }

  function MobileSourcesPanel({
    sources,
    previewSourceId,
    onPreview,
    onRemove,
  }: {
    sources: Source[];
    previewSourceId: string | null;
    onPreview: (s: Source) => void;
    onRemove: (id: string) => void;
  }) {
    return (
      <div className="max-h-48 overflow-y-auto border border-surface-border p-2 space-y-1">
        {sources.length === 0 && (
          <p className="text-xs text-text-faint px-2 py-4 text-center">No sources yet</p>
        )}
        {sources.map((src) => {
          const Icon = fileTypeIcons[src.type] || FileText;
          return (
            <div
              key={src.id}
              onClick={() => onPreview(src)}
              className={`group flex items-center gap-3 px-3 py-2 transition-colors cursor-pointer ${
                previewSourceId === src.id ? "bg-surface-elevated" : "hover:bg-surface-card"
              }`}
            >
              <Icon size={14} className="text-text-muted shrink-0" />
              <span className="text-xs truncate flex-1 text-text-muted">{src.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 ${
                src.status === "ready" ? "bg-emerald-900/50 text-emerald-400" :
                src.status === "failed" ? "bg-red-900/50 text-red-400" :
                "bg-surface-elevated text-text-muted"
              }`}>
                {src.status}
              </span>
              <button onClick={(e) => { e.stopPropagation(); onRemove(src.id); }} className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition-all shrink-0">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  function EmptyStateView({
    onFileUpload,
    onAddUrl,
  }: {
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAddUrl: () => void;
  }) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-lg mx-auto">
          <div className="w-16 h-16 mx-auto mb-6 bg-surface-card flex items-center justify-center">
            <FileText size={28} className="text-text-muted" />
          </div>
          <h2 className="text-xl font-bold text-text-outlined mb-2">Add sources to get started</h2>
          <p className="text-sm text-text-muted mb-8 leading-relaxed">
            Upload documents, add web pages, or paste YouTube links to build your knowledge base.
            Once your sources are ready, you can ask questions and generate summaries.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <label className="flex items-center justify-center gap-2 h-12 px-6 bg-surface-card hover:bg-surface-elevated text-sm transition-colors cursor-pointer border border-surface-border">
              <Plus size={16} />
              Upload file
              <input type="file" onChange={onFileUpload} className="hidden" accept=".pdf,.docx,.txt,.csv,.md,.html,.htm,.xlsx,.xls" />
            </label>
            <button
              onClick={onAddUrl}
              className="flex items-center justify-center gap-2 h-12 px-6 bg-surface-card hover:bg-surface-elevated text-sm transition-colors border border-surface-border"
            >
              <Plus size={16} />
              Add URL
            </button>
          </div>
          <p className="text-xs text-text-faint mt-6">Supports PDF, DOCX, TXT, web pages, and YouTube</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {sources.length === 0 && messages.length === 0 ? (
        <EmptyStateView onFileUpload={handleFileUpload} onAddUrl={handleAddUrl} />
      ) : (
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && !summary && (
              <div className="text-center text-text-muted mt-20">
                <p className="text-2xl font-bold tracking-tight text-text-muted">Ask anything</p>
                <p className="text-sm mt-1">Query your documents with AI</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-2xl px-5 py-4 ${
                    msg.role === "user"
                      ? "bg-surface-elevated"
                      : "bg-surface-card"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      {renderContent(msg.content || (streaming ? "..." : ""))}
                      {msg.sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-surface-border">
                          <p className="text-xs text-text-muted mb-2 font-medium">SOURCES</p>
                          <div className="flex flex-wrap gap-2">
                            {msg.sources.map((src, i) => (
                              <span
                                key={`${msg.id}-${src}-${i}`}
                                className="text-xs bg-surface-elevated text-text-muted px-2 py-1"
                              >
                                [{i + 1}] {src}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-surface-border p-4 space-y-3">
            <button
              onClick={() => setMobileSourcesOpen(!mobileSourcesOpen)}
              className="md:hidden w-full h-9 flex items-center justify-center gap-2 bg-surface-card hover:bg-surface-elevated text-xs transition-colors"
            >
              <FileText size={14} />
              {mobileSourcesOpen ? "Hide sources" : `Sources (${sources.length})`}
            </button>

            {mobileSourcesOpen && (
              <MobileSourcesPanel
                sources={filteredSources}
                previewSourceId={previewSourceId}
                onPreview={handlePreviewSource}
                onRemove={(id) => setSourceToRemove(id)}
              />
            )}

            <form onSubmit={handleSubmit} className="flex gap-3 max-w-3xl mx-auto">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question..."
                disabled={streaming}
                className="flex-1 h-12 bg-surface-card border border-surface-border px-5 text-sm outline-none focus:border-accent-brand transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={streaming || !query.trim()}
                className="w-12 h-12 bg-accent-brand text-black flex items-center justify-center hover:bg-accent-brand/90 disabled:opacity-30 transition-colors shrink-0"
              >
                {streaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          </div>
        </div>

        <aside className="hidden md:flex w-80 shrink-0 border-l border-surface-border flex-col overflow-hidden">
          <div className="p-4 border-b border-surface-border space-y-2">
            <div className="flex gap-2">
              <label className="flex-1 h-9 flex items-center justify-center gap-2 bg-surface-card hover:bg-surface-elevated text-xs transition-colors cursor-pointer">
                <Plus size={14} />
                File
                <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.docx,.txt,.csv,.md,.html,.htm,.xlsx,.xls" />
              </label>
              <button
                onClick={handleAddUrl}
                className="flex-1 h-9 flex items-center justify-center gap-2 bg-surface-card hover:bg-surface-elevated text-xs transition-colors"
              >
                <Plus size={14} />
                URL
              </button>
            </div>

            {sources.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => handleSummary("study-guide")}
                disabled={summaryLoading}
                className="flex-1 h-9 flex items-center justify-center gap-2 bg-surface-card hover:bg-surface-elevated text-xs transition-colors disabled:opacity-50"
              >
                <BookOpen size={14} />
                Study Guide
              </button>
              <button
                onClick={() => handleSummary("faq")}
                disabled={summaryLoading}
                className="flex-1 h-9 flex items-center justify-center gap-2 bg-surface-card hover:bg-surface-elevated text-xs transition-colors disabled:opacity-50"
              >
                <HelpCircle size={14} />
                FAQ
              </button>
            </div>
            )}
          </div>

          {summary && (
            <div className="p-4 border-b border-surface-border max-h-60 overflow-y-auto">
              <p className="text-xs text-text-muted mb-2">Generated summary</p>
              <div className="prose prose-invert prose-xs text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-3 pt-3 pb-1">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter sources..."
                  className="w-full h-8 bg-surface-card border border-surface-border pl-7 pr-3 text-xs outline-none focus:border-accent-brand transition-colors"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 pt-1 space-y-1">
              <p className="text-xs text-text-muted px-2 pb-2 font-medium">
                SOURCES
                {searchQuery && (
                  <span className="text-text-faint font-normal">
                    {" "}({filteredSources.length})
                  </span>
                )}
              </p>
              {filteredSources.length === 0 && (
                <p className="text-xs text-text-faint px-2">
                  {searchQuery ? "No sources match your filter" : "No sources yet"}
                </p>
              )}
              {filteredSources.map((src) => {
                const Icon = fileTypeIcons[src.type] || FileText;
                return (
                  <div
                    key={src.id}
                    onClick={() => handlePreviewSource(src)}
                    className={`group flex items-center gap-3 px-3 py-2.5 transition-colors cursor-pointer ${
                      previewSourceId === src.id ? "bg-surface-elevated" : "hover:bg-surface-card"
                    }`}
                  >
                    <Icon size={14} className="text-text-muted shrink-0" />
                    <span className="text-xs truncate flex-1 text-text-muted">{src.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 ${
                      src.status === "ready" ? "bg-emerald-900/50 text-emerald-400" :
                      src.status === "failed" ? "bg-red-900/50 text-red-400" :
                      "bg-surface-elevated text-text-muted"
                    }`}>
                      {src.status}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSourceToRemove(src.id); }}
                      className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition-all shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
      )}

      <Sheet
        open={!!previewSourceId}
        onOpenChange={(open) => { if (!open) setPreviewSourceId(null); }}
      >
        <SheetContent className="bg-surface-subtle border-surface-border text-white w-[500px] sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-sm text-text-outlined">
              {sources.find((s) => s.id === previewSourceId)?.name || "Source preview"}
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
            {previewLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={20} className="animate-spin text-text-muted" />
              </div>
            ) : (
              <pre className="text-xs text-text-muted whitespace-pre-wrap font-mono leading-relaxed">
                {previewText}
              </pre>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Dialog
        open={!!sourceToRemove}
        onOpenChange={(open) => { if (!open) setSourceToRemove(null); }}
      >
        <DialogContent className="bg-surface-subtle border-surface-border text-white">
          <DialogHeader>
            <DialogTitle className="text-sm text-text-outlined">Remove source?</DialogTitle>
            <DialogDescription className="text-xs text-text-muted mt-2">
              This will permanently delete the source and its chunks from the knowledge base.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <DialogClose className="h-9 px-4 text-xs bg-surface-card hover:bg-surface-elevated transition-colors">
              Cancel
            </DialogClose>
            <button
              onClick={() => {
                if (sourceToRemove) handleRemoveSource(sourceToRemove);
                setSourceToRemove(null);
              }}
              className="h-9 px-4 text-xs bg-red-600 hover:bg-red-500 text-white transition-colors"
            >
              Remove
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
