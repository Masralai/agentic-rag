"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  addSource,
  removeSource,
  listSources,
  listMessages,
  generateSummary,
  getSourceContent,
  setSourceEnabled,
  getLatestArtifact,
} from "../../actions";
import { Send, Plus, Loader2, BookOpen, HelpCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
import { SourceList, MobileSourcesPanel } from "@/components/source-list";
import { CitedMarkdown, SourcesFooter } from "@/components/cited-markdown";
import { UrlDialog } from "@/components/url-dialog";
import { DropZone } from "@/components/drop-zone";
import type { Source, ChatMessage, Citation } from "@/modules/node/types";

const POLL_INTERVAL = 2000;

export default function NodePage() {
  const { nodeId } = useParams() as { nodeId: string };
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [addingUrl, setAddingUrl] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSourcesOpen, setMobileSourcesOpen] = useState(false);
  const [previewSourceId, setPreviewSourceId] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewHighlight, setPreviewHighlight] = useState("");
  const [sourceToRemove, setSourceToRemove] = useState<string | null>(null);
  const [sourceSidebarWidth, setSourceSidebarWidth] = useState(320);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("psynapse-source-sidebar-width");
    if (saved) setSourceSidebarWidth(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    localStorage.setItem("psynapse-source-sidebar-width", String(sourceSidebarWidth));
  }, [sourceSidebarWidth]);

  const fetchData = useCallback(async () => {
    const [srcs, msgs] = await Promise.all([
      listSources(nodeId),
      listMessages(nodeId),
    ]);
    setSources(srcs);
    setMessages(msgs);
  }, [nodeId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    getLatestArtifact(nodeId, "study-guide").then((guide) => {
      getLatestArtifact(nodeId, "faq").then((faq) => {
        const latest = guide?.createdAt && faq?.createdAt
          ? (new Date(guide.createdAt) >= new Date(faq.createdAt) ? guide : faq)
          : guide || faq;
        if (latest?.content) setSummary(latest.content);
      });
    }).catch(() => {});
  }, [nodeId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView(); }, [messages, streaming]);

  const openCitation = async (citation: Citation) => {
    setPreviewHighlight(citation.snippet || "");
    setPreviewSourceId(citation.sourceId);
    setPreviewText("");
    setPreviewLoading(true);
    const text = await getSourceContent(citation.sourceId);
    setPreviewText(text || "No content available");
    setPreviewLoading(false);
  };

  const handleCiteClick = (msg: ChatMessage, n: number) => {
    const cite = msg.citations?.find((c) => c.index === n);
    if (cite) openCitation(cite);
  };

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, enabled } : s)));
    try {
      await setSourceEnabled(id, nodeId, enabled);
    } catch {
      toast.error("Failed to update source");
      fetchData();
    }
  };

  const anyProcessing = sources.some(
    (s) => s.status === "processing" || s.status === "pending"
  );

  useEffect(() => {
    if (!anyProcessing) return;
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [anyProcessing, fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || streaming) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      nodeId,
      role: "user",
      content: query,
      sources: [],
      citations: [],
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
        { id: crypto.randomUUID(), nodeId, role: "assistant", content: "", sources: [], citations: [], createdAt: new Date() },
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
          citations: [],
          createdAt: new Date(),
        },
      ]);
    }

    setStreaming(false);
    fetchData();
  };

  const triggerProcess = async (sourceId: string) => {
    try {
      await fetch(`/api/sources/${sourceId}/process`, { method: "POST" });
    } catch {
      // polling will pick up the failed status
    }
    fetchData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) await handleFiles(e.target.files);
    e.target.value = "";
  };

  const handleDropFiles = async (files: File[]) => {
    await handleFiles(files);
  };

  const handleFiles = async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const typeMap: Record<string, "pdf" | "docx" | "txt" | "csv" | "md" | "html" | "xlsx"> = {
        pdf: "pdf", docx: "docx", txt: "txt",
        csv: "csv", md: "md", html: "html", htm: "html",
        xlsx: "xlsx", xls: "xlsx",
      };
      const type = typeMap[ext || ""];
      if (!type) continue;

      const formData = new FormData();
      formData.append("file", file);
      const { sourceId } = await addSource(nodeId, type, formData);
      triggerProcess(sourceId);
    }
  };

  const handleAddUrl = async (url: string) => {
    const type = url.includes("youtube.com") || url.includes("youtu.be") ? "youtube" as const : "web" as const;
    const formData = new FormData();
    formData.append("url", url);
    formData.append("name", url);
    const { sourceId } = await addSource(nodeId, type, formData);
    triggerProcess(sourceId);
  };

  const handleSummary = async (type: "study-guide" | "faq") => {
    setSummaryLoading(true);
    try {
      const result = await generateSummary(nodeId, type);
      setSummary(result.content);
      toast.success("Summary generated");
    } catch {
      toast.error("Failed to generate summary");
    }
    setSummaryLoading(false);
  };

  const handleRemoveSource = async (id: string) => {
    try {
      await removeSource(id, nodeId);
      toast.success("Source removed");
    } catch {
      toast.error("Failed to remove source");
    }
    fetchData();
  };

  const handlePreviewSource = async (source: Source) => {
    if (previewSourceId === source.id) {
      setPreviewSourceId(null);
      setPreviewHighlight("");
      return;
    }
    setPreviewHighlight("");
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

  return (
    <>
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          {sources.length === 0 && messages.length === 0 ? (
            <DropZone onFiles={handleDropFiles} />
          ) : (
          <>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && !summary && (
                <div className="mt-20">
                  <div className="text-center">
                    <p className="text-base font-semibold text-text-muted">Ask anything</p>
                    <p className="text-sm mt-1 text-text-muted/70">Upload documents, ask questions, get answers</p>
                  </div>
                </div>
              )}

            <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2, delay: i * 0.03, ease: "easeOut" }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl px-5 py-4 ${
                    msg.role === "user"
                      ? "bg-surface-elevated"
                      : "bg-surface-card border border-surface-border"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className={`prose prose-invert prose-sm max-w-none ${streaming && msg.id === messages[messages.length-1]?.id ? "streaming-cursor" : ""}`}>
                      <CitedMarkdown
                        content={msg.content || ""}
                        onCite={(n) => handleCiteClick(msg, n)}
                      />
                      <SourcesFooter
                        citations={msg.citations || []}
                        onSelect={openCitation}
                      />
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
            <div aria-live="polite" className="sr-only">
              {streaming ? "Assistant is generating a response" : ""}
            </div>
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
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onPreview={handlePreviewSource}
                onRemove={(id) => setSourceToRemove(id)}
                onToggleEnabled={handleToggleEnabled}
              />
            )}

            <form onSubmit={handleSubmit} className="flex gap-3 max-w-3xl mx-auto">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question..."
                disabled={streaming}
                className="flex-1 h-12 bg-surface-card border border-surface-border px-5 text-sm outline-none focus:border-accent-brand transition-colors disabled:opacity-50 text-text-outlined"
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
          </>
          )}
        </div>

        <aside
          className="hidden md:flex shrink-0 border-l border-surface-border flex-col overflow-hidden relative"
          style={{ width: sourceSidebarWidth, minWidth: 240, maxWidth: 600 }}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-accent-brand/30 z-10 transition-colors"
            onMouseDown={(e) => {
              e.preventDefault();
              const aside = (e.currentTarget as HTMLElement).parentElement!;
              const startX = e.clientX;
              const startWidth = sourceSidebarWidth;
              let currentWidth = startWidth;
              const handleMouseMove = (e: MouseEvent) => {
                currentWidth = Math.max(240, Math.min(600, startWidth - (e.clientX - startX)));
                aside.style.width = `${currentWidth}px`;
              };
              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
                setSourceSidebarWidth(currentWidth);
              };
              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          />
          <div className="p-4 border-b border-surface-border space-y-2">
            <div className="flex gap-2">
              <label className="flex-1 h-9 flex items-center justify-center gap-2 bg-surface-card hover:bg-surface-elevated text-xs transition-colors cursor-pointer">
                <Plus size={14} />
                File
                <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.docx,.txt,.csv,.md,.html,.htm,.xlsx,.xls" />
              </label>
              <button
                onClick={() => setAddingUrl(true)}
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

          <SourceList
            sources={filteredSources}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            previewSourceId={previewSourceId}
            onPreview={handlePreviewSource}
            onRemove={(id) => setSourceToRemove(id)}
            onToggleEnabled={handleToggleEnabled}
          />
        </aside>
      </div>

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
                {previewHighlight && previewText.includes(previewHighlight)
                  ? previewText.split(previewHighlight).map((part, i, arr) => (
                      <span key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <mark className="bg-emerald-900/60 text-emerald-200">{previewHighlight}</mark>
                        )}
                      </span>
                    ))
                  : previewText}
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
            <DialogClose className="h-9 px-4 text-xs bg-surface-card hover:bg-surface-elevated transition-colors text-text-muted">
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

      <UrlDialog
        open={addingUrl}
        onOpenChange={setAddingUrl}
        onConfirm={handleAddUrl}
      />
    </>
  );
}
