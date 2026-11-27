"use client";

// Emplacement : app/communaute/components/comments/CommentComposer.tsx
// Zone de saisie : le bouton Envoyer n'apparaît que si le texte n'est pas vide ;
// pendant l'envoi il est remplacé par un spinner ; après l'envoi le champ se vide.

import { RefObject, useEffect, useState } from "react";
import { Loader2, Send, Smile } from "lucide-react";
import Avatar from "../common/Avatar";
import StickerPicker from "./StickerPicker";
import { LIMITS } from "../../lib/Constants";
import { useCurrentUser } from "../../lib/useCurrentUser";

export interface ComposerPayload {
  contenu?: string;
  sticker?: string;
}

const HIDDEN_KEY = "ti_stickers_hidden";

export default function CommentComposer({
  onSubmit,
  placeholder = "Écrire un commentaire...",
  autoFocus = false,
  showStickersByDefault = false,
  inputRef,
}: {
  onSubmit: (payload: ComposerPayload) => Promise<boolean>;
  placeholder?: string;
  autoFocus?: boolean;
  showStickersByDefault?: boolean;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
}) {
  const me = useCurrentUser();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [stickersOpen, setStickersOpen] = useState(false);

  // La bande de stickers est proposée par défaut, sauf si l'utilisateur l'a masquée
  useEffect(() => {
    if (!showStickersByDefault) return;
    try {
      setStickersOpen(localStorage.getItem(HIDDEN_KEY) !== "1");
    } catch {
      setStickersOpen(true);
    }
  }, [showStickersByDefault]);

  const closeStickers = () => {
    setStickersOpen(false);
    try {
      localStorage.setItem(HIDDEN_KEY, "1");
    } catch {}
  };

  const toggleStickers = () => {
    if (stickersOpen) return closeStickers();
    setStickersOpen(true);
    try {
      localStorage.removeItem(HIDDEN_KEY);
    } catch {}
  };

  const send = async (payload: ComposerPayload) => {
    if (sending) return;
    setSending(true);
    const ok = await onSubmit(payload);
    setSending(false);
    if (ok && payload.contenu !== undefined) setText("");
  };

  const hasText = text.trim().length > 0;

  return (
    <div>
      {stickersOpen && (
        <StickerPicker
          disabled={sending}
          onPick={(id) => send({ sticker: id })}
          onClose={closeStickers}
        />
      )}

      <div className="flex items-end gap-2.5">
        <Avatar pp={me?.pp} name={me?.name} size={36} className="mb-0.5" />

        <div className="flex flex-1 items-end gap-1 rounded-2xl bg-slate-100 px-3 py-1.5">
          <textarea
            ref={inputRef}
            autoFocus={autoFocus}
            value={text}
            rows={1}
            maxLength={LIMITS.commentaire}
            disabled={sending}
            placeholder={placeholder}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={(e) => {
              // Entrée envoie sur ordinateur ; sur mobile Entrée = nouvelle ligne
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                window.matchMedia("(pointer: fine)").matches
              ) {
                e.preventDefault();
                if (hasText) send({ contenu: text.trim() });
              }
            }}
            className="max-h-[120px] min-h-[28px] flex-1 resize-none bg-transparent py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-60"
          />

          <button
            type="button"
            onClick={toggleStickers}
            aria-label="Stickers"
            className={`mb-0.5 shrink-0 rounded-full p-1.5 transition hover:bg-slate-200 ${
              stickersOpen ? "text-orange-700" : "text-slate-500"
            }`}
          >
            <Smile size={20} />
          </button>

          {sending ? (
            <span className="mb-0.5 shrink-0 p-1.5">
              <Loader2 size={20} className="animate-spin text-orange-700" />
            </span>
          ) : (
            hasText && (
              <button
                type="button"
                onClick={() => send({ contenu: text.trim() })}
                aria-label="Envoyer"
                className="mb-0.5 shrink-0 rounded-full p-1.5 text-orange-700 transition hover:bg-orange-100 active:scale-90"
              >
                <Send size={20} />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
