import { UserButton } from "@clerk/nextjs";
import { NotebookList } from "./_components/notebook-list";
import { ErrorBoundary } from "@/components/error-boundary";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-black text-white">
      <aside className="w-72 shrink-0 border-r border-zinc-900 flex flex-col">
        <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-900">
          <h1 className="text-sm font-bold tracking-tight">NOTEBOOKS</h1>
          <UserButton />
        </div>
        <NotebookList />
      </aside>
      <main className="flex-1 flex flex-col min-w-0">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  );
}
