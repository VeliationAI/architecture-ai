import { Github, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const GITHUB_URL = "https://github.com/VeliationAI/architecture-ai";

export function AppFooter() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--card)]/40 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <Badge variant="success">MIT Open Source</Badge>
            <span className="text-xs text-[var(--muted)]">Architecture AI Studio</span>
          </div>
          <p className="text-[11px] text-[var(--muted)] flex items-center justify-center sm:justify-start gap-1">
            Built with <Heart className="w-3 h-3 text-red-400 fill-red-400/30" /> by{" "}
            <a
              href="https://www.linkedin.com/in/akhilvydyula/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-hover)] hover:underline"
            >
              Akhil Vydyula
            </a>
            {" & "}
            <a
              href="https://www.linkedin.com/in/sankara-reddy-thamma-18a6a6ba/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-hover)] hover:underline"
            >
              Sai Sankara Thamma
            </a>
          </p>
        </div>

        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] border border-[var(--border)] text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/40 hover:bg-[var(--card-hover)] transition-all"
        >
          <Github className="w-4 h-4" />
          Star on GitHub
        </a>
      </div>
    </footer>
  );
}
