"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { NodeList } from "./_components/node-list";
import { ErrorBoundary } from "@/components/error-boundary";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-black text-white">
      <aside className="hidden lg:flex w-72 shrink-0 border-r border-zinc-900 flex-col">
        <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-900">
          <h1 className="text-sm font-bold tracking-tight">NODES</h1>
          <UserButton />
        </div>
        <NodeList />
      </aside>

      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 w-9 h-9 flex items-center justify-center bg-zinc-900 rounded-lg"
      >
        <Menu size={16} />
      </button>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="bg-zinc-950 border-zinc-900 text-white w-72 p-0">
          <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-900">
            <h1 className="text-sm font-bold tracking-tight">NODES</h1>
            <UserButton />
          </div>
          <NodeList />
        </SheetContent>
      </Sheet>

      <main className="flex-1 flex flex-col min-w-0">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  );
}
