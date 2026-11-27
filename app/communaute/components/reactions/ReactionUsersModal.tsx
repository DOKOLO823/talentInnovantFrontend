"use client";

// Qui a réagi ? Onglets par type de réaction, liste paginée issue du backend.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/app/lib/api";
import ModalShell from "../common/ModalShell";
import Avatar from "../common/Avatar";
import { reactionOf, type ReactionType } from "../../lib/Constants";
import type { ReactionResume } from "../../lib/Types";

interface Row {
  type: string;
  auteur: {
    id: number;
    nom_complet: string;
    pp: string | null;
    profession: string | null;
  };
}

export default function ReactionUsersModal({
  postId,
  initialType,
  resume,
  onClose,
}: {
  postId: number;
  initialType: ReactionType;
  resume: ReactionResume[];
  onClose: () => void;
}) {
  const [type, setType] = useState<string>(initialType);
  const [tabs, setTabs] = useState<ReactionResume[]>(resume);
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(
    async (p: number) => {
      const id = ++requestId.current;
      setLoading(true);
      setError(false);
      try {
        const res = await apiFetch(
          `/communaute/posts/${postId}/reactions?type=${type}&page=${p}`,
          { method: "GET" },
        );
        if (id !== requestId.current) return;
        if (res?.statut !== 200) throw new Error();
        setRows((prev) => (p === 1 ? res.data : [...prev, ...res.data]));
        setPage(p);
        setHasMore(!!res.has_more);
        if (res.resume?.length) setTabs(res.resume);
      } catch {
        if (id === requestId.current) setError(true);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [postId, type],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <ModalShell
      open
      onClose={onClose}
      title="Réactions"
      panelClassName="sm:max-w-md sm:h-[70vh] h-[75vh]"
      zClass="z-[880]"
    >
      <div className="flex gap-2 overflow-x-auto border-b border-slate-100 px-4 py-2.5">
        {tabs.map((t) => (
          <button
            key={t.type}
            onClick={() => setType(t.type)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              type === t.type
                ? "bg-orange-100 text-orange-700"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>{reactionOf(t.type)?.emoji}</span>
            {t.count}
          </button>
        ))}
      </div>

      <div className="px-4 py-2">
        {error ? (
          <div className="py-10 text-center">
            <p className="mb-3 text-sm text-slate-500">
              Impossible de charger la liste.
            </p>
            <button
              onClick={() => load(1)}
              className="rounded-lg bg-orange-700 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-800"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            {rows.map((r) => (
              <Link
                key={r.auteur.id}
                href={`/profil-talent/${r.auteur.id}`}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-50"
              >
                <span className="relative shrink-0">
                  <Avatar
                    pp={r.auteur.pp}
                    name={r.auteur.nom_complet}
                    size={44}
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs shadow ring-1 ring-slate-200">
                    {reactionOf(r.type)?.emoji}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-slate-900">
                    {r.auteur.nom_complet}
                  </span>
                  {r.auteur.profession && (
                    <span className="block truncate text-xs text-slate-500">
                      {r.auteur.profession}
                    </span>
                  )}
                </span>
              </Link>
            ))}

            {loading && (
              <p className="py-6 text-center text-sm text-slate-400">
                Chargement...
              </p>
            )}
            {!loading && rows.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-400">
                Aucune réaction de ce type.
              </p>
            )}
            {!loading && hasMore && (
              <button
                onClick={() => load(page + 1)}
                className="my-2 text-sm font-semibold text-orange-700 hover:underline"
              >
                Voir plus
              </button>
            )}
          </>
        )}
      </div>
    </ModalShell>
  );
}
