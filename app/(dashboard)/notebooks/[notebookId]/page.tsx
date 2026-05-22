"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { addSource, removeSource, listSources, listMessages, generateSummary, getSourceContent } from "../../actions";
import { FileText, Send, Plus, X, Loader2, BookOpen, HelpCircle, File as FileIcon, Search } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Source, ChatMessage } from "@/modules/notebook/types";

const fileTypeIcons: Record<string, any> = {
  pdf: FileText,
  docx: FileText,
  txt: FileText,
  web: FileIcon,
  youtube: FileIcon,
};

export default function NotebookPage() {
  const { notebookId } = useParams() as { notebookId: string };
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewSourceId, setPreviewSourceId] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    const [srcs, msgs] = await Promise.all([
      listSources(notebookId),
      listMessages(notebookId),
    ]);
    setSources(srcs);
    setMessages(msgs);
  }, [notebookId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView(); }, [messages, streaming]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || streaming) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      notebookId,
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
        body: JSON.stringify({ notebookId, query: userMsg.content }),
      });

      if (!res.ok) throw new Error("Stream failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), notebookId, role: "assistant", content: "", sources: [], createdAt: new Date() },
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
          notebookId,
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
    const typeMap: Record<string, "pdf" | "docx" | "txt"> = {
      pdf: "pdf", docx: "docx", txt: "txt",
    };
    const type = typeMap[ext || ""];
    if (!type) { alert("Unsupported file type"); return; }

    const formData = new FormData();
    formData.append("file", file);
    await addSource(notebookId, type, formData);
    fetchData();
  };

  const handleAddUrl = async () => {
    const url = prompt("Enter URL:");
    if (!url) return;
    const type = url.includes("youtube.com") || url.includes("youtu.be") ? "youtube" as const : "web" as const;
    const formData = new FormData();
    formData.append("url", url);
    formData.append("name", url);
    await addSource(notebookId, type, formData);
    fetchData();
  };

  const handleSummary = async (type: "study-guide" | "faq") => {
    setSummaryLoading(true);
    const result = await generateSummary(notebookId, type);
    setSummary(result.content);
    setSummaryLoading(false);
  };

  const handleRemoveSource = async (id: string) => {
    await removeSource(id, notebookId);
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

  return (
    <>
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && !summary && (
              <div className="text-center text-zinc-600 mt-20">
                <p className="text-2xl font-bold tracking-tight text-zinc-500">Ask anything</p>
                <p className="text-sm mt-1">Query your documents with AI</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-2xl px-5 py-4 ${
                    msg.role === "user"
                      ? "bg-zinc-800 rounded-2xl"
                      : "bg-zinc-900 rounded-2xl"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content || (streaming ? "..." : "")}
                      </ReactMarkdown>
                      {msg.sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-2 font-medium">SOURCES</p>
                          <div className="flex flex-wrap gap-2">
                            {msg.sources.map((src, i) => (
                              <span
                                key={`${msg.id}-${src}-${i}`}
                                className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded"
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

          <div className="border-t border-zinc-900 p-4">
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-3xl mx-auto">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question..."
                disabled={streaming}
                className="flex-1 h-12 bg-zinc-900 border border-zinc-800 px-5 text-sm outline-none focus:border-emerald-500 rounded-xl transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={streaming || !query.trim()}
                className="w-12 h-12 bg-emerald-500 text-black flex items-center justify-center rounded-xl hover:bg-emerald-400 disabled:opacity-30 transition-colors shrink-0"
              >
                {streaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          </div>
        </div>

        <aside className="w-80 shrink-0 border-l border-zinc-900 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-zinc-900 space-y-2">
            <div className="flex gap-2">
              <label className="flex-1 h-9 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-xs transition-colors rounded-lg cursor-pointer">
                <Plus size={14} />
                File
                <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.docx,.txt" />
              </label>
              <button
                onClick={handleAddUrl}
                className="flex-1 h-9 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-xs transition-colors rounded-lg"
              >
                <Plus size={14} />
                URL
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleSummary("study-guide")}
                disabled={summaryLoading}
                className="flex-1 h-9 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-xs transition-colors rounded-lg disabled:opacity-50"
              >
                <BookOpen size={14} />
                Study Guide
              </button>
              <button
                onClick={() => handleSummary("faq")}
                disabled={summaryLoading}
                className="flex-1 h-9 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-xs transition-colors rounded-lg disabled:opacity-50"
              >
                <HelpCircle size={14} />
                FAQ
              </button>
            </div>
          </div>

          {summary && (
            <div className="p-4 border-b border-zinc-900 max-h-60 overflow-y-auto">
              <p className="text-xs text-zinc-500 mb-2">Generated summary</p>
              <div className="prose prose-invert prose-xs text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-3 pt-3 pb-1">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter sources..."
                  className="w-full h-8 bg-zinc-900 border border-zinc-800 pl-7 pr-3 text-xs outline-none focus:border-emerald-500 rounded-lg transition-colors"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 pt-1 space-y-1">
              <p className="text-xs text-zinc-600 px-2 pb-2 font-medium">
                SOURCES
                {searchQuery && (
                  <span className="text-zinc-700 font-normal">
                    {" "}({filteredSources.length})
                  </span>
                )}
              </p>
              {filteredSources.length === 0 && (
                <p className="text-xs text-zinc-700 px-2">
                  {searchQuery ? "No sources match your filter" : "No sources yet"}
                </p>
              )}
              {filteredSources.map((src) => {
                const Icon = fileTypeIcons[src.type] || FileText;
                return (
                  <div
                    key={src.id}
                    onClick={() => handlePreviewSource(src)}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                      previewSourceId === src.id ? "bg-zinc-800" : "hover:bg-zinc-900"
                    }`}
                  >
                    <Icon size={14} className="text-zinc-500 shrink-0" />
                    <span className="text-xs truncate flex-1 text-zinc-400">{src.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      src.status === "ready" ? "bg-emerald-900/50 text-emerald-400" :
                      src.status === "failed" ? "bg-red-900/50 text-red-400" :
                      "bg-zinc-800 text-zinc-500"
                    }`}>
                      {src.status}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveSource(src.id); }}
                      className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all shrink-0"
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

      <Sheet
        open={!!previewSourceId}
        onOpenChange={(open) => { if (!open) setPreviewSourceId(null); }}
      >
        <SheetContent className="bg-zinc-950 border-zinc-900 text-white w-[500px] sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-sm text-zinc-300">
              {sources.find((s) => s.id === previewSourceId)?.name || "Source preview"}
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
            {previewLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={20} className="animate-spin text-zinc-600" />
              </div>
            ) : (
              <pre className="text-xs text-zinc-400 whitespace-pre-wrap font-mono leading-relaxed">
                {previewText}
              </pre>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
