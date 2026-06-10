"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface ServiceIconProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  tile?: boolean;
}

export function ServiceIcon({ src, alt, size = 28, className, tile = true }: ServiceIconProps) {
  return (
    <div
      className={cn(
        "shrink-0 rounded-md overflow-hidden flex items-center justify-center",
        tile
          ? "bg-white border border-[var(--border-subtle)] shadow-sm"
          : "bg-[var(--background-elevated)] border border-[var(--border-subtle)]",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={cn("object-contain", tile ? "p-1" : "p-0.5")}
        unoptimized
      />
    </div>
  );
}
