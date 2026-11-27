"use client";

// Emplacement : app/communaute/components/post/PostMedia.tsx
// Présentation des fichiers comme Facebook : 1 = pleine largeur, 2 = côte à côte,
// 3 = 1 grand + 2 petits, 4+ = grille 2x2 avec « +N » sur la dernière case.

import { Play } from "lucide-react";
import apifile from "@/app/lib/apifile";
import type { PostFichier } from "../lib/Types";

const url = (f: PostFichier) => `${apifile}/${f.chemin}`;

function Tile({
  fichier,
  onClick,
  className = "",
  extra,
}: {
  fichier: PostFichier;
  onClick: () => void;
  className?: string;
  extra?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden bg-slate-200 ${className}`}
    >
      {fichier.type === "image" ? (
        <img
          src={url(fichier)}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <>
          <video
            src={`${url(fichier)}#t=0.1`}
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white">
              <Play size={22} fill="currentColor" />
            </span>
          </span>
        </>
      )}
      {extra && extra > 0 ? (
        <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-3xl font-bold text-white">
          +{extra}
        </span>
      ) : null}
    </button>
  );
}

export default function PostMedia({
  fichiers,
  onOpen,
}: {
  fichiers: PostFichier[];
  onOpen: (index: number) => void;
}) {
  const n = fichiers.length;
  if (n === 0) return null;

  // 1 fichier : image entière (hauteur limitée) ou vidéo lisible directement
  if (n === 1) {
    const f = fichiers[0];
    return f.type === "image" ? (
      <button
        type="button"
        onClick={() => onOpen(0)}
        className="block w-full bg-slate-100"
      >
        <img
          src={url(f)}
          alt=""
          loading="lazy"
          className="mx-auto max-h-[560px] w-full object-contain"
        />
      </button>
    ) : (
      <video
        src={url(f)}
        controls
        playsInline
        preload="metadata"
        className="max-h-[560px] w-full bg-black"
      />
    );
  }

  const cell = "h-full w-full";

  if (n === 2) {
    return (
      <div className="grid aspect-[4/3] grid-cols-2 gap-0.5">
        {fichiers.map((f, i) => (
          <Tile
            key={f.id}
            fichier={f}
            onClick={() => onOpen(i)}
            className={cell}
          />
        ))}
      </div>
    );
  }

  if (n === 3) {
    return (
      <div className="grid aspect-[4/3] grid-cols-2 grid-rows-2 gap-0.5">
        <Tile
          fichier={fichiers[0]}
          onClick={() => onOpen(0)}
          className={`${cell} row-span-2`}
        />
        <Tile
          fichier={fichiers[1]}
          onClick={() => onOpen(1)}
          className={cell}
        />
        <Tile
          fichier={fichiers[2]}
          onClick={() => onOpen(2)}
          className={cell}
        />
      </div>
    );
  }

  // 4 fichiers ou plus : 4 cases, « +N » sur la dernière
  return (
    <div className="grid aspect-[4/3] grid-cols-2 grid-rows-2 gap-0.5">
      {fichiers.slice(0, 4).map((f, i) => (
        <Tile
          key={f.id}
          fichier={f}
          onClick={() => onOpen(i)}
          className={cell}
          extra={i === 3 ? n - 4 : undefined}
        />
      ))}
    </div>
  );
}
