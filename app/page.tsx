'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { askAgent, uploadFile, listDocuments } from './actions';
import { Search, Loader2, Sparkles, Database, FileText, Upload, Plus, X, ArrowRight } from 'lucide-react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial documents
  useEffect(() => {
    const fetchDocs = async () => {
      const docs = await listDocuments();
      setDocuments(Array.isArray(docs) ? docs : []);
    };
    fetchDocs();
  }, []);

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
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
    if (res.success) {
      const updatedDocs = await listDocuments();
      setDocuments(updatedDocs);
    }
    setUploading(false);
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-black text-white selection:bg-white selection:text-black">
      
      {/* Left Sidebar: Sources / Documents (NotebookLM style) */}
      <aside className="lg:col-span-3 border-r border-zinc-900 bg-zinc-950/20 p-8 flex flex-col gap-8 h-full">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <Database size={12} className="opacity-50" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-semibold">Knowledge Pool</span>
          </div>
          <h2 className="text-xl font-medium">Sources</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-between p-4 bg-white/5 border border-zinc-800 rounded-2xl hover:bg-white/10 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                {uploading ? <Loader2 className="animate-spin text-zinc-500" size={16} /> : <Plus size={16} className="text-zinc-500 group-hover:text-white transition-colors" />}
              </div>
              <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">Add Source</span>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          </button>

          <AnimatePresence initial={false}>
            {documents.length > 0 ? (
              <div className="flex flex-col gap-2">
                {documents.map((doc, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={doc.name}
                    className="flex items-center gap-3 p-4 bg-zinc-900/40 border border-zinc-900/50 rounded-2xl hover:border-zinc-700 transition-all cursor-default"
                  >
                    <FileText size={16} className="text-zinc-600" />
                    <span className="text-xs text-zinc-400 truncate flex-1">{doc.name}</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center border border-dashed border-zinc-900 rounded-3xl opacity-20">
                <FileText size={24} className="mb-2" />
                <span className="text-[10px] uppercase tracking-widest">No Sources</span>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-auto pt-8 border-t border-zinc-900 opacity-20">
          <p className="text-[10px] uppercase tracking-[0.3em]">Agentic-RAG v1.0</p>
        </div>
      </aside>

      {/* Main Content Area: Chat / Query */}
      <section className="lg:col-span-9 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[150px] -z-10 opacity-30 pointer-events-none" />
        
        <div className="w-full max-w-2xl flex flex-col gap-12">
          <header className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-zinc-500">
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-medium">Assistant</span>
            </div>
            <h1 className="text-4xl font-medium tracking-tight">Ask your <span className="text-zinc-600">documents.</span></h1>
          </header>

          <form onSubmit={handleQuerySubmit} className="relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What would you like to know?"
              className="w-full bg-zinc-950/50 border border-zinc-900 rounded-[2.5rem] px-8 py-6 text-xl outline-none focus:border-zinc-700 transition-all placeholder:text-zinc-800 glass shadow-2xl"
            />
            <button
              disabled={loading || !query.trim()}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
            </button>
          </form>

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col gap-10"
              >
                <div className="space-y-6">
                  <div className="text-xl leading-relaxed text-zinc-200 font-light border-l-2 border-zinc-800 pl-8 py-2">
                    {result.completion}
                  </div>
                </div>

                {result.sources && result.sources.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Cited Evidence</span>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(result.sources)).map((source: any, i) => (
                        <span key={i} className="px-4 py-2 bg-zinc-950 border border-zinc-900 text-zinc-500 rounded-xl text-xs font-mono">
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
