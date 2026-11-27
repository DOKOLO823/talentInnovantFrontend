"use client";

// Bouton + en bas à gauche : se déploie une fois (« Partager un projet »), puis se replie en simple +.
// Plus compact sur mobile.

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

export default function FloatingAddButton({
  onClick,
}: {
  onClick: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const open = setTimeout(() => setExpanded(true), 500);
    const close = setTimeout(() => setExpanded(false), 4500);
    return () => {
      clearTimeout(open);
      clearTimeout(close);
    };
  }, []);

  return (
    <button
      onClick={onClick}
      aria-label="Partager un projet"
      className="fixed bottom-24 left-3 z-40 flex h-10 items-center rounded-full bg-orange-700 px-2.5 text-white shadow-lg shadow-orange-900/20 transition-colors hover:bg-orange-800 active:scale-95 sm:left-4 sm:h-12 sm:px-3.5"
    >
      <Plus className="h-[18px] w-[18px] shrink-0 sm:h-[22px] sm:w-[22px]" />
      <span
        className={`overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-500 sm:text-sm ${
          expanded
            ? "ml-1.5 max-w-[150px] opacity-100 sm:ml-2"
            : "ml-0 max-w-0 opacity-0"
        }`}
      >
        Partager un projet
      </span>
    </button>
  );
}
