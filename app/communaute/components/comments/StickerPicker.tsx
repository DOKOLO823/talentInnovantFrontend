"use client";

// Emplacement : app/communaute/components/comments/StickerPicker.tsx
// Bande de stickers discrète (défilement horizontal) avec une croix pour la masquer.
// Pour ajouter des stickers : voir lib/stickers.ts

import { X } from "lucide-react";
import { STICKERS, type Sticker } from "../../lib/Stickers";

export function StickerView({
  sticker,
  size = 28,
}: {
  sticker: Sticker;
  size?: number;
}) {
  return sticker.src ? (
    <img
      src={sticker.src}
      alt={sticker.label}
      style={{ width: size, height: size }}
      className="object-contain"
    />
  ) : (
    <span
      style={{ fontSize: size }}
      className="leading-none"
      role="img"
      aria-label={sticker.label}
    >
      {sticker.emoji}
    </span>
  );
}

export default function StickerPicker({
  onPick,
  onClose,
  disabled,
}: {
  onPick: (id: string) => void;
  onClose: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="mb-2 flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5">
      <div className="flex flex-1 items-center gap-1 overflow-x-auto scrollbar-hide">
        {STICKERS.map((s) => (
          <button
            key={s.id}
            type="button"
            title={s.label}
            disabled={disabled}
            onClick={() => onPick(s.id)}
            className="shrink-0 rounded-lg p-1.5 transition hover:scale-110 hover:bg-white active:scale-95 disabled:opacity-50"
          >
            <StickerView sticker={s} size={26} />
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Masquer les stickers"
        className="shrink-0 rounded-full p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-700"
      >
        <X size={16} />
      </button>
    </div>
  );
}
