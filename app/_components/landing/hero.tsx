"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export function Hero() {
  const { isSignedIn } = useAuth();
  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_50%,_#10b98108_0%,_transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_80%,_#10b98106_0%,_transparent_60%)] pointer-events-none" />
      <div className="absolute top-1 inset-x-0 text-center text-[clamp(8rem,20vw,20rem)] leading-none text-white/[0.015] select-none pointer-events-none font-serif font-light tracking-[-0.04em]">
        PSYNAPSE
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0, 1] }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0, 1] }}
            className="font-serif text-[clamp(2.5rem,8vw,7rem)] leading-[0.95] tracking-[-0.03em]"
          >
            <span className="text-white">Query your</span>
            <br />
            <span className="text-emerald-400/90">documents</span>
            <br />
            <span className="text-white">with language</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0, 1] }}
            className="mt-8 text-base sm:text-lg text-text-muted leading-relaxed max-w-xl font-sans tracking-[0.02em] sm:tracking-[0.01em]"
          >
            Upload PDFs, DOCX, and TXT files. Scrape web pages and fetch YouTube
            transcripts. Ask questions in plain language — answers stream back
            instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35, ease: [0.25, 0.1, 0, 1] }}
            className="mt-10 flex gap-4"
          >
            <Link
              href={isSignedIn ? "/nodes" : "/sign-in"}
              className="group inline-flex items-center justify-center bg-accent-brand text-black border border-accent-brand px-6 py-3.5 text-sm transition-all duration-200 active:scale-[0.97]"
            >
              <span>Get started</span>
              <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center border border-surface-border text-text-muted hover:text-white px-6 py-3.5 text-sm transition-all duration-200 active:scale-[0.97]"
            >
              Learn more
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0, 1] }}
          className="hidden lg:block"
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-accent-muted animate-breathe pointer-events-none" />
            <div className="relative bg-surface-card border border-surface-border overflow-hidden">
              <div className="h-8 bg-surface-subtle border-b border-surface-border flex items-center px-3 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                <span className="ml-3 text-[10px] text-text-faint font-mono">psynapse — query.ts</span>
              </div>
              <div className="p-5 font-mono text-xs leading-relaxed">
                <div><span className="text-emerald-400/70">const</span> <span className="text-blue-400/70">knowledge</span> = <span className="text-emerald-400/70">await</span> loadSources([</div>
                <div className="pl-4"><span className="text-orange-400/70">&quot;q3_report.pdf&quot;</span>,</div>
                <div className="pl-4"><span className="text-orange-400/70">&quot;research_paper.docx&quot;</span>,</div>
                <div className="pl-4"><span className="text-orange-400/70">&quot;transcript.txt&quot;</span></div>
                <div>])</div>
                <div className="mt-2"><span className="text-emerald-400/70">const</span> answer = <span className="text-emerald-400/70">await</span> query(knowledge, <span className="text-orange-400/70">&quot;What are the key findings?&quot;</span>)</div>
                <div className="mt-2 text-text-muted">{`// → Revenue grew 18% YoY [1][2]`}</div>
                <div className="flex gap-1 mt-3">
                  {[0.45, 0.72, 0.3, 0.9, 0.55].map((w, i) => (
                    <div key={i} className="flex-1 h-1.5 bg-surface-border overflow-hidden">
                      <div
                        className="h-full bg-accent-brand transition-all"
                        style={{ width: `${w * 100}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
