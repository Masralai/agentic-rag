"use client";

import { motion } from "framer-motion";
import { Upload, Cpu, MessageSquareText } from "lucide-react";

const stages = [
  {
    icon: Upload,
    label: "Add a source",
    description: "Upload a file or paste a URL",
    detail: "PDF, DOCX, TXT, web pages, YouTube transcripts — all handled automatically.",
    mockup: (
      <div className="bg-surface-card border border-surface-border p-[22px]">
        <div className="border-2 border-dashed border-surface-border/50 py-6 flex flex-col items-center gap-2">
          <Upload size={18} className="text-emerald-400/90" />
          <p className="text-[11px] text-text-muted font-medium">Drop files or paste URL</p>
          <p className="text-[9px] text-text-faint">PDF &middot; DOCX &middot; TXT</p>
        </div>
      </div>
    ),
  },
  {
    icon: Cpu,
    label: "Indexed to memory",
    description: "Content is chunked and embedded",
    detail: "Each source is split into chunks, embedded into vectors, and stored for semantic retrieval.",
    mockup: (
      <div className="bg-surface-card border border-surface-border p-[22px]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-full h-2 bg-surface-border overflow-hidden">
              <div className="h-full w-3/4 bg-emerald-500/30" />
            </div>
            <span className="text-[9px] text-text-muted font-ui-mono w-8 text-right tracking-[0.22em]">74%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-full h-2 bg-surface-border overflow-hidden">
              <div className="h-full w-full bg-emerald-500/30" />
            </div>
            <span className="text-[9px] text-text-muted font-ui-mono w-8 text-right tracking-[0.22em]">100%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-full h-2 bg-surface-border overflow-hidden">
              <div className="h-full w-1/2 bg-surface-border/50" />
            </div>
            <span className="text-[9px] text-text-muted font-ui-mono w-8 text-right tracking-[0.22em]">50%</span>
          </div>
        </div>
        <p className="text-[9px] text-text-faint mt-3 font-ui-mono tracking-[0.22em]">3 sources &middot; 47 chunks indexed</p>
      </div>
    ),
  },
  {
    icon: MessageSquareText,
    label: "Query with citations",
    description: "Ask questions, get cited answers",
    detail: "Answers stream in real-time with numbered citations so you can verify every claim.",
    mockup: (
      <div className="bg-surface-card border border-surface-border p-[22px]">
        <div className="space-y-2">
          <div className="flex justify-end">
            <div className="bg-surface-elevated px-3 py-2 max-w-[85%]">
              <p className="text-[10px] text-white">Summarize the key findings</p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-surface-card border border-surface-border px-3 py-2 max-w-[90%]">
              <p className="text-[10px] text-text-outlined">
                Based on the uploaded sources
                <sup className="citation text-[8px]">[1]</sup>
                <sup className="citation text-[8px]">[2]</sup>
                ...
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="px-6 py-28 sm:py-36 border-t border-surface-border">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16 sm:mb-20"
        >
          
          <h2 className="font-serif text-[clamp(1.75rem,5vw,3.5rem)] tracking-[-0.02em] leading-[1.05]">
            Three operations,
            <br />
            <span className="text-emerald-400/90">one flow</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {stages.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0, 1] }}
              className="relative"
            >
              <div className="mb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-surface-subtle border border-surface-border flex items-center justify-center">
                    <s.icon size={14} className="text-emerald-400/90" />
                  </div>
                  <span className="text-[11px] text-text-muted font-ui-mono tracking-[0.06em]">
                    {(i + 1).toString().padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-serif text-lg text-white mb-1">{s.label}</h3>
                <p className="text-sm text-text-muted font-sans tracking-[0.03em]">{s.description}</p>
              </div>

              {s.mockup}

              <p className="mt-4 text-xs text-text-muted leading-relaxed font-sans tracking-[0.08em]">{s.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
