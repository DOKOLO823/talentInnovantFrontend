"use client";

// Emplacement : app/communaute/components/common/ExpandableText.tsx
// Texte limité à N lignes avec « Voir plus / Voir moins » (le bouton n'apparaît que si le texte déborde).

import { ReactNode, useEffect, useRef, useState } from "react";

// Les classes Tailwind doivent être écrites en entier pour être détectées
const CLAMP: Record<number, string> = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
};

export default function ExpandableText({
  children,
  lines = 3,
  className = "",
  moreLabel = "Voir plus",
  lessLabel = "Voir moins",
}: {
  children: ReactNode;
  lines?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  moreLabel?: string;
  lessLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      if (!expanded) setOverflowing(el.scrollHeight > el.clientHeight + 1);
    };
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children, expanded, lines]);

  return (
    <>
      <div
        ref={ref}
        className={`${className} ${expanded ? "" : CLAMP[lines]} break-words`}
      >
        {children}
      </div>
      {(overflowing || expanded) && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault(); // utile quand le texte est dans un lien
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="text-xs font-semibold text-orange-700 hover:underline"
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      )}
    </>
  );
}
