import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-surface-border px-6">
      <div className="max-w-6xl mx-auto py-8 flex items-center justify-between">
        <p className="text-base font-semibold tracking-tight text-text-outlined">Psynapse</p>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/yourusername/psynapse"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-muted hover:text-text-outlined transition-colors"
          >
            GitHub
          </a>
          <p className="text-sm text-text-muted">&copy; {new Date().getFullYear()} Psynapse</p>
        </div>
      </div>
    </footer>
  );
}
