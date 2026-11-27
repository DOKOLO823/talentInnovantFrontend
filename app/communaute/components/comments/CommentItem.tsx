"use client";

// Emplacement : app/communaute/components/comments/CommentItem.tsx
// Un commentaire principal + ses réponses (liées par un trait, dépliables).

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import Avatar from "../common/Avatar";
import ExpandableText from "../common/ExpandableText";
import ReactionButton from "../reactions/ReactionButton";
import ReactionSummary from "../reactions/ReactionSummary";
import CommentComposer, { type ComposerPayload } from "./CommentComposer";
import { StickerView } from "./StickerPicker";
import { getSticker } from "../../lib/Stickers";
import { useReaction } from "../../lib/useReaction";
import type { Commentaire } from "../../lib/Types";

// ---------------------------------------------------------------- une bulle
function Bubble({
  comment,
  onReply,
  small = false,
}: {
  comment: Commentaire;
  onReply: () => void;
  small?: boolean;
}) {
  const [c, setC] = useState(comment);
  const sticker = getSticker(c.sticker);

  const { react } = useReaction(
    {
      ma_reaction: c.ma_reaction,
      reactions_count: c.reactions_count,
      reactions_resume: c.reactions_resume,
    },
    (next) => setC((prev) => ({ ...prev, ...next })),
    `/communaute/commentaires/${c.id}/reaction`,
  );

  return (
    <div className="flex gap-2.5">
      <Link href={`/profil-talent/${c.auteur.id}`} className="shrink-0">
        <Avatar
          pp={c.auteur.pp}
          name={c.auteur.nom_complet}
          size={small ? 30 : 36}
        />
      </Link>

      <div className="min-w-0 flex-1">
        {sticker ? (
          <div className="relative inline-block max-w-full">
            <Link
              href={`/profil-talent/${c.auteur.id}`}
              className="mb-1 block text-[13px] font-semibold text-slate-800 hover:underline"
            >
              {c.auteur.nom_complet}
            </Link>
            <StickerView sticker={sticker} size={72} />
            {c.reactions_count > 0 && (
              <ReactionSummary
                resume={c.reactions_resume}
                count={c.reactions_count}
                className="absolute -bottom-2 -right-3 rounded-full bg-white px-1.5 py-0.5 shadow"
              />
            )}
          </div>
        ) : (
          <div className="relative inline-block max-w-full rounded-2xl bg-slate-100 px-3.5 py-2.5">
            <Link
              href={`/profil-talent/${c.auteur.id}`}
              className="block text-[13px] font-semibold text-slate-900 hover:underline"
            >
              <ExpandableText lines={1}>{c.auteur.nom_complet}</ExpandableText>
            </Link>
            {c.reply_to && (
              <span className="text-xs font-semibold text-orange-700">
                ↳ {c.reply_to.nom_complet}{" "}
              </span>
            )}
            <ExpandableText
              lines={4}
              className="whitespace-pre-line text-sm leading-relaxed text-slate-700"
            >
              {c.contenu}
            </ExpandableText>
            {c.reactions_count > 0 && (
              <ReactionSummary
                resume={c.reactions_resume}
                count={c.reactions_count}
                className="absolute -bottom-2.5 -right-3 rounded-full bg-white px-1.5 py-0.5 shadow"
              />
            )}
          </div>
        )}

        <div className="mt-1.5 flex items-center gap-4 px-2 text-xs text-slate-500">
          <span title={c.created_at}>{c.il_y_a}</span>
          <ReactionButton compact current={c.ma_reaction} onReact={react} />
          <button
            onClick={onReply}
            className="font-semibold transition hover:text-slate-800"
          >
            Répondre
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------ commentaire principal + réponses
export default function CommentItem({
  comment,
  onSubmitReply,
}: {
  comment: Commentaire;
  onSubmitReply: (
    payload: ComposerPayload,
    parent: { id: number; replyToId: number },
  ) => Promise<Commentaire | null>;
}) {
  const [repliesCount, setRepliesCount] = useState(comment.reponses_count);
  const [replies, setReplies] = useState<Commentaire[]>([]);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [hasMoreReplies, setHasMoreReplies] = useState(false);
  const [repliesPage, setRepliesPage] = useState(0);
  const [replyTarget, setReplyTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const loadReplies = async (page: number) => {
    setLoadingReplies(true);
    try {
      const res = await apiFetch(
        `/communaute/commentaires/${comment.id}/reponses?page=${page}`,
        {
          method: "GET",
        },
      );
      if (res?.statut === 200) {
        setReplies((prev) =>
          page === 1
            ? res.data
            : [
                ...prev,
                ...res.data.filter(
                  (n: Commentaire) => !prev.some((o) => o.id === n.id),
                ),
              ],
        );
        setRepliesPage(page);
        setHasMoreReplies(!!res.has_more);
        setRepliesLoaded(true);
      }
    } finally {
      setLoadingReplies(false);
    }
  };

  const toggleReplies = () => {
    if (!showReplies && !repliesLoaded) loadReplies(1);
    setShowReplies((v) => !v);
  };

  const submitReply = async (payload: ComposerPayload) => {
    if (!replyTarget) return false;
    const created = await onSubmitReply(payload, {
      id: comment.id,
      replyToId: replyTarget.id,
    });
    if (!created) return false;

    setRepliesCount((n) => n + 1);
    setReplyTarget(null);
    setShowReplies(true);
    if (repliesLoaded) setReplies((prev) => [...prev, created]);
    else loadReplies(1); // la liste chargée contiendra déjà la nouvelle réponse
    return true;
  };

  return (
    <div>
      <Bubble
        comment={comment}
        onReply={() =>
          setReplyTarget({
            id: comment.auteur.id,
            name: comment.auteur.nom_complet,
          })
        }
      />

      {/* Réponses : retrait + trait vertical pour les distinguer du commentaire parent */}
      {(repliesCount > 0 || replyTarget) && (
        <div className="ml-[18px] mt-2 border-l-2 border-slate-200 pl-4">
          {repliesCount > 0 && (
            <button
              onClick={toggleReplies}
              className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-orange-700"
            >
              {showReplies ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
              {showReplies
                ? "Masquer les réponses"
                : `Voir ${repliesCount} réponse${repliesCount > 1 ? "s" : ""}`}
              {loadingReplies && <Loader2 size={12} className="animate-spin" />}
            </button>
          )}

          {showReplies && (
            <div className="space-y-3">
              {replies.map((r) => (
                <Bubble
                  key={r.id}
                  comment={r}
                  small
                  onReply={() =>
                    setReplyTarget({
                      id: r.auteur.id,
                      name: r.auteur.nom_complet,
                    })
                  }
                />
              ))}
              {hasMoreReplies && (
                <button
                  onClick={() => loadReplies(repliesPage + 1)}
                  disabled={loadingReplies}
                  className="text-xs font-semibold text-orange-700 hover:underline disabled:opacity-60"
                >
                  {loadingReplies ? "Chargement..." : "Voir plus de réponses"}
                </button>
              )}
            </div>
          )}

          {replyTarget && (
            <div className="mt-3">
              <p className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
                <span>
                  En réponse à{" "}
                  <b className="text-slate-700">{replyTarget.name}</b>
                </span>
                <button
                  onClick={() => setReplyTarget(null)}
                  className="font-semibold hover:text-slate-800"
                >
                  Annuler
                </button>
              </p>
              <CommentComposer
                autoFocus
                placeholder={`Répondre à ${replyTarget.name}...`}
                onSubmit={submitReply}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
