"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-end sm:items-center overflow-hidden px-6 pb-24 sm:pb-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,_#10b98110_0%,_transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_80%,_#10b98108_0%,_transparent_60%)] pointer-events-none" />

      <div className="absolute top-12 text-[clamp(8rem,20vw,20rem)] leading-none text-white/[0.015] select-none pointer-events-none font-serif font-light tracking-[-0.04em] pl-44">
        PSYNAPSE
      </div>

      <div className="relative w-full max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0, 1] }}
          className="font-serif text-[clamp(2.5rem,8vw,7rem)] leading-[0.95] tracking-[-0.03em] max-w-4xl"
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
          transition={{ duration: 0.5, delay: 0.25, ease: [0.25, 0.1, 0, 1] }}
          className="mt-8 text-base sm:text-lg text-text-muted leading-relaxed max-w-xl font-sans tracking-[0.02em] sm:tracking-[0.01em]"
        >
          Upload PDFs, DOCX, and TXT files. Scrape web pages and fetch YouTube
          transcripts. Ask questions in plain language — answers stream back with
          numbered source citations.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: [0.25, 0.1, 0, 1] }}
          className="mt-10"
        >
          <Link
            href="/sign-in"
            className="group inline-flex items-center justify-center bg-accent-brand text-black border border-accent-brand px-5 py-3.5 text-sm transition-all duration-200"
          >
            <span>Get started</span>
            <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
