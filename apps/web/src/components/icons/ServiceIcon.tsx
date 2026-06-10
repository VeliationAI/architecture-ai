"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface ServiceIconProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export function ServiceIcon({ src, alt, size = 28, className }: ServiceIconProps) {
  return (
    <div
      className={cn(
        "shrink-0 rounded-md overflow-hidden bg-[var(--background-elevated)] border border-[var(--border-subtle)] flex items-center justify-center",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="object-contain p-0.5"
        unoptimized
      />
    </div>
  );
}
