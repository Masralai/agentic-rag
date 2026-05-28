"use client";

import { motion } from "framer-motion";

export function Features() {
  return (
    <section className="px-6 py-28 sm:py-36">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-20 sm:mb-28"
        >
          <h2 className="font-serif text-[clamp(1.75rem,5vw,3.5rem)] tracking-[-0.02em] leading-[1.05] max-w-2xl">
            Ask questions across
            <br />
            <span className="text-emerald-400/90">everything</span> you upload
          </h2>
        </motion.div>

        <div className="space-y-16 sm:space-y-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0, 1] }}
            className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center"
          >
            <div className="lg:col-span-3 order-2 lg:order-1">
              
              <h3 className="font-serif text-2xl sm:text-3xl tracking-[-0.02em] text-white mb-4">
                Natural language over your knowledge base
              </h3>
              <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-md font-sans tracking-[0.03em] sm:tracking-[0.02em]">
                Every source you upload is chunked, embedded, and indexed into a
                vector store. Ask questions in plain language — the relevant
                context is retrieved automatically and answers stream back with
                numbered citations linked to the original material.
              </p>
            </div>

            <div className="lg:col-span-2 order-1 lg:order-2">
              <div className="bg-surface-card border border-surface-border overflow-hidden">
                <div className="h-8 bg-surface-subtle border-b border-surface-border" />
                <div className="p-[22px] space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-surface-elevated px-3.5 py-2.5 max-w-[85%]">
                      <p className="text-xs text-white">
                        What are the key findings from the Q3 earnings report?
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-surface-card border border-surface-border px-3.5 py-2.5 max-w-[90%]">
                      <p className="text-xs text-text-outlined leading-relaxed">
                        Revenue grew 18% year-over-year, driven primarily by
                        enterprise segment expansion
                        <sup className="citation">[1]</sup>. Operating margins
                        improved 320bps due to cost optimization initiatives
                        <sup className="citation">[2]</sup>.
                      </p>
                      <div className="mt-2.5 pt-2.5 border-t border-surface-border">
                        
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[9px] bg-surface-subtle text-text-muted px-1.5 py-0.5">
                            [1] q3_report.pdf
                          </span>
                          <span className="text-[9px] bg-surface-subtle text-text-muted px-1.5 py-0.5">
                            [2] earnings_call.docx
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0, 1] }}
            className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center"
          >
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="bg-surface-card border border-surface-border p-[22px]">
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "PDF", desc: "Documents" },
                    { label: "DOCX", desc: "Word files" },
                    { label: "TXT", desc: "Plain text" },
                    { label: "Web", desc: "Pages & articles" },
                    { label: "YouTube", desc: "Video transcripts" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center gap-2 bg-surface-subtle border border-surface-border px-3 py-2"
                    >
                      <div className="w-1.5 h-1.5 bg-emerald-400/60" />
                      <span className="text-xs font-medium text-white">{s.label}</span>
                      <span className="text-[10px] text-text-outlined">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 order-1 lg:order-2">
              
              <h3 className="font-serif text-2xl sm:text-3xl tracking-[-0.02em] text-white mb-4">
                One interface, any format
              </h3>
              <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-md font-sans tracking-[0.03em] sm:tracking-[0.02em]">
                PDF, DOCX, TXT, web pages, and YouTube transcripts. Drop a file
                or paste a URL — content is automatically chunked, embedded, and
                indexed into a vector store. No manual organization required.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0, 1] }}
            className="max-w-3xl ml-auto"
          >
            <div className="bg-surface-card border border-surface-border p-6 sm:p-8">
              <h3 className="font-serif text-2xl sm:text-3xl tracking-[-0.02em] text-white mb-4">
                Generate study guides and FAQs from your sources
              </h3>
              <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-lg font-sans tracking-[0.03em] sm:tracking-[0.02em]">
                With a single click, produce structured study guides or FAQ
                sheets based entirely on your uploaded material. Not generic
                knowledge — your documents, summarized.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
