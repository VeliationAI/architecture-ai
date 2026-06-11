"use client";

import { useMemo, useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_LOCAL_SRC = "/demo/demo.mp4";

function youtubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (parsed.pathname.startsWith("/embed/")) return url;
    }
  } catch {
    return null;
  }
  return null;
}

function loomEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("loom.com")) {
      const match = parsed.pathname.match(/\/share\/([a-zA-Z0-9]+)/);
      if (match?.[1]) return `https://www.loom.com/embed/${match[1]}`;
    }
  } catch {
    return null;
  }
  return null;
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url) || url.startsWith("/demo/");
}

export function DemoVideo() {
  const configured = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL?.trim();
  const [localFailed, setLocalFailed] = useState(false);

  const embed = useMemo(() => {
    if (!configured) return null;
    return youtubeEmbedUrl(configured) ?? loomEmbedUrl(configured);
  }, [configured]);

  const directSrc = useMemo(() => {
    if (configured && isDirectVideo(configured)) return configured;
    if (!configured && !localFailed) return DEFAULT_LOCAL_SRC;
    return null;
  }, [configured, localFailed]);

  if (embed) {
    return (
      <div className="mb-10 animate-fade-in">
        <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-3 text-center">
          See it in action
        </p>
        <div className="relative aspect-video w-full max-w-3xl mx-auto rounded-[var(--radius)] overflow-hidden border border-[var(--border-subtle)] shadow-[var(--shadow-lg)] bg-black">
          <iframe
            src={embed}
            title="Architecture AI Studio demo"
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (directSrc) {
    return (
      <div className="mb-10 animate-fade-in">
        <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-3 text-center">
          See it in action
        </p>
        <div className="relative aspect-video w-full max-w-3xl mx-auto rounded-[var(--radius)] overflow-hidden border border-[var(--border-subtle)] shadow-[var(--shadow-lg)] bg-black">
          <video
            src={directSrc}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-contain bg-black"
            onError={() => setLocalFailed(true)}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10 animate-fade-in">
      <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-3 text-center">
        See it in action
      </p>
      <div
        className={cn(
          "relative aspect-video w-full max-w-3xl mx-auto rounded-[var(--radius)] overflow-hidden",
          "border border-dashed border-[var(--border)] bg-[var(--card)]/40",
          "flex flex-col items-center justify-center gap-2 px-6 text-center"
        )}
      >
        <div className="w-12 h-12 rounded-full bg-[var(--accent-muted)] flex items-center justify-center">
          <Play className="w-5 h-5 text-[var(--accent)] ml-0.5" />
        </div>
        <p className="text-sm font-medium text-[var(--foreground)]">Demo video coming soon</p>
        <p className="text-xs text-[var(--muted)] max-w-md">
          Add <code className="text-[var(--accent-hover)]">apps/web/public/demo/demo.mp4</code> or set{" "}
          <code className="text-[var(--accent-hover)]">NEXT_PUBLIC_DEMO_VIDEO_URL</code> in{" "}
          <code className="text-[var(--accent-hover)]">.env.local</code>.
        </p>
      </div>
    </div>
  );
}
