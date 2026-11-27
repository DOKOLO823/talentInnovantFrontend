"use client";

import { reactionOf, type ReactionType } from "../../lib/Constants";
import type { ReactionResume } from "../../lib/Types";

export default function ReactionSummary({
  resume,
  count,
  className = "",
  onOpen,
}: {
  resume: ReactionResume[];
  count: number;
  className?: string;
  onOpen?: (type: ReactionType) => void;
}) {
  if (count <= 0 || resume.length === 0) return null;

  const detail = resume
    .map((r) => `${reactionOf(r.type)?.emoji ?? ""} ${r.count}`)
    .join("  ·  ");

  return (
    <span
      title={detail}
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      <span className="flex -space-x-1.5">
        {resume.slice(0, 3).map((r) => (
          <button
            key={r.type}
            type="button"
            disabled={!onOpen}
            aria-label={`Voir qui a réagi : ${reactionOf(r.type)?.label ?? r.type} (${r.count})`}
            onClick={() => onOpen?.(r.type as ReactionType)}
            className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white text-[12px] leading-none shadow-sm ring-2 ring-white transition hover:scale-110 disabled:hover:scale-100"
          >
            {reactionOf(r.type)?.emoji}
          </button>
        ))}
      </span>
      <button
        type="button"
        disabled={!onOpen}
        onClick={() => onOpen?.(resume[0].type as ReactionType)}
        className="text-sm text-slate-600 hover:underline disabled:no-underline"
      >
        {count}
      </button>
    </span>
  );
}
