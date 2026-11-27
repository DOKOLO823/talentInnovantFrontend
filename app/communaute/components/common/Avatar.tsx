"use client";

// Emplacement : app/communaute/components/common/Avatar.tsx
import apifile from "@/app/lib/apifile";

export default function Avatar({
  pp,
  name = "",
  size = 40,
  className = "",
}: {
  pp?: string | null;
  name?: string;
  size?: number;
  className?: string;
}) {
  const fallback = "/assets/images/pp2.png";
  return (
    <img
      src={pp ? `${apifile}/${pp}` : fallback}
      alt={name}
      style={{ width: size, height: size }}
      className={`rounded-full object-cover bg-slate-200 shrink-0 ${className}`}
      onError={(e) => {
        const img = e.currentTarget as HTMLImageElement;
        if (!img.src.endsWith(fallback)) img.src = fallback;
      }}
    />
  );
}
