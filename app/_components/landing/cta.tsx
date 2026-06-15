"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

export function Cta() {
  const { isSignedIn } = useAuth();
  return (
    <section className="relative px-6 py-36 sm:py-48 border-t border-surface-border overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,_#10b98110_0%,_transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_30%_at_50%_30%,_#10b98106_0%,_transparent_60%)] pointer-events-none" />

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0, 1] }}
        >
          
          <h2 className="font-serif text-[clamp(2rem,6vw,4.5rem)] tracking-[-0.03em] leading-[1] text-white mb-5">
            Turn your documents
            <br />
            into answers
          </h2>
          <p className="text-sm sm:text-base text-text-muted mb-10 max-w-md mx-auto font-sans tracking-[0.03em] sm:tracking-[0.02em]">
            Sign in and start building your knowledge base.
            <br />
            No credit card required.
          </p>
          <Link
            href={isSignedIn ? "/nodes" : "/sign-in"}
            className="group inline-flex items-center justify-center bg-accent-brand text-black border border-accent-brand px-5 py-3.5 text-sm transition-all duration-200"
          >
            <span>Get started</span>
            <ArrowRight size={14} className="ml-2 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
