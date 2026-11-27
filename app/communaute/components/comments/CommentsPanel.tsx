"use client";

// Emplacement : app/communaute/components/comments/CommentsPanel.tsx
// Liste des commentaires (tri récents / populaires) + saisie. Utilisé par la fenêtre ET la page de détail.

import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "@/app/lib/api";
import CommentItem from "./CommentItem";
import CommentComposer, { type ComposerPayload } from "./CommentComposer";
import { CommentSkeleton } from "../common/Skeletons";
import type { Commentaire } from "../../lib/Types";
import Link from "next/link";
import { apiErrorMessage, LOGIN_PATH } from "../../lib/notify";
import { useRequireAuth } from "../../lib/useRequireAuth";

export default function CommentsPanel({
  postId,
  onCountChange,
  inputRef,
  composerOffsetClass = "bottom-0",
}: {
  postId: number;
  onCountChange: (delta: number) => void; // met à jour le compteur du projet
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  composerOffsetClass?: string; // ex : "bottom-[4.5rem] md:bottom-0" sur la page (barre du bas)
}) {
  const [tri, setTri] = useState<"recents" | "populaires">("recents");
  const [items, setItems] = useState<Commentaire[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const requestId = useRef(0);
  const { isAuth, ready, requireAuth } = useRequireAuth();

  const load = useCallback(
    async (p: number) => {
      const id = ++requestId.current;
      if (p === 1) setLoading(true);
      else setLoadingMore(true);
      setError(false);
      try {
        const res = await apiFetch(
          `/communaute/posts/${postId}/commentaires?tri=${tri}&page=${p}`,
          { method: "GET" },
        );
        if (id !== requestId.current) return;
        if (res?.statut !== 200) throw new Error();
        setItems((prev) =>
          p === 1
            ? res.data
            : [
                ...prev,
                ...res.data.filter(
                  (n: Commentaire) => !prev.some((o) => o.id === n.id),
                ),
              ],
        );
        setPage(p);
        setHasMore(!!res.has_more);
      } catch {
        if (id === requestId.current) setError(true);
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [postId, tri],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  /** Publie un commentaire (ou une réponse). Retourne le commentaire créé, sinon null. */
  const submit = async (
    payload: ComposerPayload,
    parent?: { id: number; replyToId: number },
  ): Promise<Commentaire | null> => {
    if (!requireAuth("Connectez-vous pour commenter.")) return null;
    try {
      const res = await apiFetch(`/communaute/posts/${postId}/commentaires`, {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          parent_id: parent?.id ?? null,
          reply_to_user_id: parent?.replyToId ?? null,
        }),
      });
      if (res?.statut !== 200) {
        toast.error(
          res?.message || "Votre commentaire n'a pas pu être envoyé.",
        );
        return null;
      }
      toast.success("Votre commentaire a été ajouté.");
      onCountChange(1);
      return res.data as Commentaire;
    } catch (e) {
      toast.error(
        apiErrorMessage(e, "Votre commentaire n'a pas pu être envoyé."),
      );
      return null;
    }
  };

  const submitMain = async (payload: ComposerPayload) => {
    const created = await submit(payload);
    if (!created) return false;
    setItems((prev) => [created, ...prev]);
    return true;
  };

  return (
    <div>
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <h4 className="text-sm font-bold text-slate-900">Commentaires</h4>
        <select
          value={tri}
          onChange={(e) => setTri(e.target.value as "recents" | "populaires")}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="recents">Plus récents</option>
          <option value="populaires">Plus populaires</option>
        </select>
      </div>

      <div className="px-4 pb-4">
        {loading ? (
          <CommentSkeleton />
        ) : error ? (
          <div className="py-8 text-center">
            <p className="mb-3 text-sm text-slate-500">
              Impossible de charger les commentaires.
            </p>
            <button
              onClick={() => load(1)}
              className="rounded-lg bg-orange-700 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-800"
            >
              Réessayer
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <MessageCircle className="mx-auto mb-2" size={32} />
            <p className="text-sm">Soyez le premier à commenter ce projet.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {items.map((c) => (
              <CommentItem key={c.id} comment={c} onSubmitReply={submit} />
            ))}
            {hasMore && (
              <button
                onClick={() => load(page + 1)}
                disabled={loadingMore}
                className="text-sm font-semibold text-orange-700 hover:underline disabled:opacity-60"
              >
                {loadingMore ? "Chargement..." : "Voir plus de commentaires"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Saisie toujours visible en bas */}
      <div
        className={`sticky ${composerOffsetClass} z-10 border-t border-slate-100 bg-white px-4 py-3`}
      >
        {ready && !isAuth ? (
          <p className="text-center text-sm text-slate-600">
            <Link
              href={LOGIN_PATH}
              className="font-semibold text-orange-700 hover:underline"
            >
              Connectez-vous
            </Link>{" "}
            pour commenter ce projet.
          </p>
        ) : (
          <CommentComposer
            inputRef={inputRef}
            showStickersByDefault
            onSubmit={submitMain}
          />
        )}
      </div>
    </div>
  );
}
