"use client";

// Emplacement : app/communaute/hooks/usePostList.ts
// Liste paginée de projets (fil d'actualité, onglet Communauté d'un profil...).

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import type { Post } from "../lib/Types";

export function usePostList(
  path: string,
  params: Record<string, string> = {},
  enabled = true,
) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const requestId = useRef(0);
  const paramsKey = JSON.stringify(params);

  const load = useCallback(
    async (p: number) => {
      const id = ++requestId.current;
      if (p === 1) setLoading(true);
      else setLoadingMore(true);
      setError(false);

      try {
        const qs = new URLSearchParams({ ...JSON.parse(paramsKey), page: String(p) });
        const res = await apiFetch(`${path}?${qs.toString()}`, { method: "GET" });
        if (id !== requestId.current) return; // réponse périmée
        if (res?.statut !== 200) throw new Error();

        setPosts((prev) =>
          p === 1
            ? res.data
            : [...prev, ...res.data.filter((n: Post) => !prev.some((o) => o.id === n.id))],
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
    [path, paramsKey],
  );

  useEffect(() => {
    if (enabled) load(1);
  }, [load, enabled]);

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore: () => load(page + 1),
    reload: () => load(1),
    /** Modifie un projet localement (compteurs, réaction...) */
    updatePost: (id: number, patch: Partial<Post>) =>
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
    /** Retire un projet de la liste (suppression) */
    removePost: (id: number) => setPosts((prev) => prev.filter((p) => p.id !== id)),
    /** Ajoute un projet en tête (nouvelle publication) */
    prependPost: (post: Post) =>
      setPosts((prev) => [post, ...prev.filter((p) => p.id !== post.id)]),
  };
}