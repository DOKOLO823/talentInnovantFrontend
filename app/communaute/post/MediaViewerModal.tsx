"use client";

// Emplacement : app/communaute/components/post/MediaViewerModal.tsx
// Visionneuse plein écran : flèches, glissement au doigt, clavier, bulles indicatrices.

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import apifile from "@/app/lib/apifile";
import type { PostFichier } from "../lib/Types";

export default function MediaViewerModal({
  fichiers,
  startIndex,
  onClose,
}: {
  fichiers: PostFichier[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [mounted, setMounted] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const total = fichiers.length;

  useEffect(() => setMounted(true), []);

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + total) % total),
    [total],
  );

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [go, onClose]);

  if (!mounted) return null;

  const current = fichiers[index];
  const src = `${apifile}/${current.chemin}`;

  return createPortal(
    <div
      className="fixed inset-0 z-[900] flex flex-col bg-black/95"
      onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStartX.current === null || total < 2) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 50) go(dx > 0 ? -1 : 1);
        touchStartX.current = null;
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm font-medium">
          {index + 1} / {total}
        </span>
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="rounded-full p-2 transition hover:bg-white/15"
        >
          <X size={24} />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-2 sm:px-14">
        {total > 1 && (
          <button
            onClick={() => go(-1)}
            aria-label="Précédent"
            className="absolute left-2 z-10 hidden rounded-full bg-white/15 p-2.5 text-white transition hover:bg-white/30 sm:block"
          >
            <ChevronLeft size={26} />
          </button>
        )}

        {current.type === "image" ? (
          <img
            key={current.id}
            src={src}
            alt=""
            className="max-h-[80vh] max-w-full select-none object-contain"
          />
        ) : (
          <video
            key={current.id}
            src={src}
            controls
            autoPlay
            playsInline
            className="max-h-[80vh] max-w-full"
          />
        )}

        {total > 1 && (
          <button
            onClick={() => go(1)}
            aria-label="Suivant"
            className="absolute right-2 z-10 hidden rounded-full bg-white/15 p-2.5 text-white transition hover:bg-white/30 sm:block"
          >
            <ChevronRight size={26} />
          </button>
        )}
      </div>

      {total > 1 && (
        <div className="flex items-center justify-center gap-2 py-5">
          {fichiers.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setIndex(i)}
              aria-label={`Fichier ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index
                  ? "w-6 bg-white"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}
