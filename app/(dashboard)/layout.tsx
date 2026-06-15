"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { NodeList } from "./_components/node-list";
import { ErrorBoundary } from "@/components/error-boundary";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem("psynapse-sidebar-width");
    if (saved) setSidebarWidth(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    localStorage.setItem("psynapse-sidebar-width", String(sidebarWidth));
  }, [sidebarWidth]);

  return (
    <TooltipProvider>
    <div className="flex min-h-[100dvh] bg-black text-white">
      <aside
        className="hidden lg:flex shrink-0 border-r border-surface-border flex-col relative"
        style={{ width: sidebarWidth, minWidth: 240, maxWidth: 600 }}
      >
        <div className="h-[56px] px-5 flex items-center justify-between border-b border-surface-border">
          <h1 className="text-sm font-bold tracking-tight">PSYNAPSE</h1>
          <UserButton />
        </div>
        <NodeList />
        <div
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-accent-brand/30 z-10 transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            const aside = (e.currentTarget as HTMLElement).parentElement!;
            const startX = e.clientX;
            const startWidth = sidebarWidth;
            let currentWidth = startWidth;
            const handleMouseMove = (e: MouseEvent) => {
              currentWidth = Math.max(240, Math.min(600, startWidth + e.clientX - startX));
              aside.style.width = `${currentWidth}px`;
            };
            const handleMouseUp = () => {
              document.removeEventListener("mousemove", handleMouseMove);
              document.removeEventListener("mouseup", handleMouseUp);
              setSidebarWidth(currentWidth);
            };
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
          }}
        />
      </aside>

      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 w-9 h-9 flex items-center justify-center bg-surface-card"
        aria-label="Open navigation"
      >
        <Menu size={16} />
      </button>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="bg-surface-subtle border-surface-border text-white w-80 p-0">
          <div className="h-[56px] px-5 flex items-center justify-between border-b border-surface-border">
            <h1 className="text-sm font-bold tracking-tight">PSYNAPSE</h1>
            <UserButton />
          </div>
          <NodeList />
        </SheetContent>
      </Sheet>

      <main className="flex-1 flex flex-col min-w-0">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="flex-1 flex flex-col"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
    </div>
    </TooltipProvider>
  );
}
