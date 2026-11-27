"use client";

// Emplacement : app/communaute/components/reactions/ReactionButton.tsx
// Bouton « J'aime » : un clic = j'aime / retirer ; appui long (mobile) ou survol (PC) = choix de la réaction.

import { useEffect, useRef, useState } from "react";
import { ThumbsUp } from "lucide-react";
import {
  REACTIONS,
  reactionOf,
  type ReactionType,
} from "@/app/communaute/lib/Constants";

export default function ReactionButton({
  current,
  onReact,
  compact = false,
  className = "",
}: {
  current: ReactionType | null;
  onReact: (type: ReactionType) => void;
  compact?: boolean; // version discrète pour les commentaires
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  useEffect(() => clearTimers, []);

  // Ferme la liste en touchant ailleurs
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  const reaction = reactionOf(current);

  return (
    <div
      ref={wrapRef}
      className="relative"
      // Survol : uniquement à la souris (sur mobile un simple appui ne doit pas ouvrir la liste)
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        clearTimers();
        openTimer.current = setTimeout(() => setOpen(true), 450);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        clearTimers();
        closeTimer.current = setTimeout(() => setOpen(false), 250);
      }}
    >
      {open && (
        <div
          className="absolute bottom-full left-0 z-30 mb-2 flex items-center gap-0.5 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-xl"
          onPointerEnter={() =>
            closeTimer.current && clearTimeout(closeTimer.current)
          }
        >
          {REACTIONS.map((r) => (
            <button
              key={r.type}
              type="button"
              title={r.label}
              onClick={() => {
                onReact(r.type);
                setOpen(false);
              }}
              className="px-1 text-[26px] leading-none transition-transform hover:scale-125 active:scale-110"
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          if (longPressed.current) {
            longPressed.current = false; // l'appui long a déjà ouvert la liste
            return;
          }
          onReact(current ?? "like");
          setOpen(false);
        }}
        onTouchStart={() => {
          longPressed.current = false;
          openTimer.current = setTimeout(() => {
            longPressed.current = true;
            setOpen(true);
          }, 450);
        }}
        onTouchEnd={() => openTimer.current && clearTimeout(openTimer.current)}
        onTouchMove={() => openTimer.current && clearTimeout(openTimer.current)}
        onContextMenu={(e) => e.preventDefault()}
        className={`flex items-center justify-center gap-2 select-none transition active:scale-95 ${className} ${
          compact ? "text-xs font-semibold" : "text-sm font-semibold"
        } ${reaction ? reaction.color : "text-slate-600"}`}
      >
        {reaction ? (
          <>
            <span
              className={
                compact ? "text-sm leading-none" : "text-lg leading-none"
              }
            >
              {reaction.emoji}
            </span>
            {reaction.label}
          </>
        ) : (
          <>
            <ThumbsUp size={compact ? 14 : 18} />
            J'aime
          </>
        )}
      </button>
    </div>
  );
}
