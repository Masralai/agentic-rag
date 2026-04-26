'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { askAgent, uploadFile, listDocuments } from './actions';
import { 
  Loader2, 
  Database, 
  FileText, 
  Plus, 
  X,
  Send,
  File,
  FileSpreadsheet,
  Image,
  Presentation,
  AlertCircle,
} from 'lucide-react';

interface Document {
  name: string;
  size?: number;
  type?: string;
}

interface Result {
  completion?: string;
  sources?: string[];
  error?: string;
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return FileText;
    case 'csv':
    case 'xlsx':
    case 'xls': return FileSpreadsheet;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp': return Image;
    case 'ppt':
    case 'pptx': return Presentation;
    default: return File;
  }
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = useCallback(async () => {
    const docs = await listDocuments();
    setDocuments(Array.isArray(docs) ? docs : []);
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    setResult(null);
    const res = await askAgent(query);
    setResult(res);
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await uploadFile(formData);
    if (res.success) await fetchDocs();
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Mobile Header - Solid black, no blur */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 px-4 flex items-center justify-between bg-black border-b border-zinc-900">
        <button
          onClick={toggleSidebar}
          className="w-12 h-12 flex items-center justify-center -ml-2"
          aria-label="Toggle sources"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        
        <h1 className="text-lg font-bold tracking-tighter">AGENTIC</h1>

        <div className="w-12" />
      </header>

      {/* Sidebar - Full height, solid */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="lg:hidden fixed inset-0 z-40 bg-black/90"
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-30
          w-full lg:w-72 xl:w-80 flex flex-col
          bg-black border-r border-zinc-900
          transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center">
                <Database size={16} className="text-black" />
              </div>
              <span className="text-sm font-bold tracking-tight">SOURCES</span>
            </div>
            <button
              onClick={closeSidebar}
              className="lg:hidden w-10 h-10 flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>

          {/* Upload Button - Solid, no border dash drama */}
          <div className="p-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full h-14 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Plus size={18} />
              )}
              <span className="text-sm font-medium">Add file</span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
            </button>
          </div>

          {/* Documents - Simple list */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {documents.length > 0 ? (
              <div className="space-y-1">
                {documents.map((doc) => {
                  const FileIcon = getFileIcon(doc.name);
                  return (
                    <div
                      key={doc.name}
                      className="flex items-center gap-3 p-3 hover:bg-zinc-900 transition-colors cursor-default"
                    >
                      <FileIcon size={16} className="text-zinc-500" />
                      <span className="text-sm truncate">{doc.name}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-600">
                <p className="text-sm">No sources</p>
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-zinc-900">
            <p className="text-xs text-zinc-600">v1.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content - No ambient junk */}
      <main className="flex-1 lg:pt-0 pt-16 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-12 lg:py-20">
          
          {/* Hero - Bold typography */}
          <header className="mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tighter leading-none mb-4">
              Ask<br />anything
            </h1>
            <p className="text-lg text-zinc-500">
              Query your documents with AI.
            </p>
          </header>

          {/* Query Input - Solid, no glass */}
          <form onSubmit={handleQuerySubmit} className="mb-12">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type your question..."
                disabled={loading}
                className="w-full h-16 lg:h-20 bg-zinc-900 border-2 border-zinc-900 px-6 pr-20 text-lg lg:text-xl placeholder:text-zinc-600 outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-emerald-500 text-black flex items-center justify-center hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Send"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </form>

          {/* Result - Direct display */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="animate-fade-in"
              >
                {result.completion && (
                  <div className="bg-zinc-900 p-6 lg:p-8">
                    <p className="text-lg lg:text-xl leading-relaxed whitespace-pre-wrap">
                      {result.completion}
                    </p>
                  </div>
                )}

                {result.sources && result.sources.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {Array.from(new Set(result.sources)).map((source, i) => (
                      <span 
                        key={i} 
                        className="px-3 py-1.5 bg-zinc-900 text-zinc-500 text-sm"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                )}

                {result.error && (
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle size={18} />
                    <span>{result.error}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}