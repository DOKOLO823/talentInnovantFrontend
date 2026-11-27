"use client";

// Emplacement : app/communaute/components/Feed.tsx
// Fil d'actualité : tri, défilement infini, challenges et partenaires intercalés, fenêtre des commentaires.

import {
  Fragment,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Loader2, RotateCcw } from "lucide-react";
import TopChallengesList from "@/app/components/TopChallengesList";
import PartenairesAccueil from "@/app/home-talent/components/PartenairesAccueil";
import { useAuth } from "@/app/context/AuthContext";
import PostCard from "../post/PostCard";
import CommentsModal from "./comments/CommentsModal";
import { PostSkeleton } from "./common/Skeletons";
import { usePostList } from "../hooks/usePostList";
import type { Post } from "../lib/Types";

export interface FeedHandle {
  prepend: (post: Post) => void;
}

const TRIS = [
  { value: "pertinents", label: "Pour vous" },
  { value: "recents", label: "Plus récents" },
  { value: "populaires", label: "Plus populaires" },
];

// Positions (index du projet après lequel on intercale un bloc)
const AFTER_CHALLENGES = 2; // après le 3e projet
const AFTER_PARTNERS = 6; // après le 7e projet

const Feed = forwardRef<FeedHandle, { onAddClick: () => void }>(function Feed(
  { onAddClick },
  ref,
) {
  const { token } = useAuth();
  const [tri, setTri] = useState("pertinents");
  const [commentsPostId, setCommentsPostId] = useState<number | null>(null);

  const list = usePostList("/communaute/posts", { tri });
  const sentinel = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({ prepend: list.prependPost }), [
    list.prependPost,
  ]);

  // Défilement infini : on charge la suite quand le bas de liste approche
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          list.hasMore &&
          !list.loading &&
          !list.loadingMore
        ) {
          list.loadMore();
        }
      },
      { rootMargin: "700px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [list.hasMore, list.loading, list.loadingMore, list.loadMore]);

  const openedPost = list.posts.find((p) => p.id === commentsPostId) ?? null;

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
          Fil d'actualité
        </h2>
        <select
          value={tri}
          onChange={(e) => setTri(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
        >
          {TRIS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {list.loading ? (
        <PostSkeleton count={3} />
      ) : list.error && list.posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
          <p className="mb-4 text-sm text-slate-500">
            Impossible de charger les projets.
          </p>
          <button
            onClick={list.reload}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-800"
          >
            <RotateCcw size={16} /> Réessayer
          </button>
        </div>
      ) : list.posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-lg font-bold text-slate-800">
            Aucun projet pour le moment
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            Soyez le premier à partager un projet avec la communauté.
          </p>
          <button
            onClick={onAddClick}
            className="mt-5 rounded-xl bg-orange-700 px-6 py-3 text-sm font-bold text-white hover:bg-orange-800"
          >
            Ajouter un projet
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {list.posts.map((post, i) => (
            <Fragment key={post.id}>
              <PostCard
                post={post}
                onUpdate={(patch) => list.updatePost(post.id, patch)}
                onDeleted={list.removePost}
                onComment={() => setCommentsPostId(post.id)}
              />

              {i === AFTER_CHALLENGES && <TopChallengesList compact />}

              {i === AFTER_PARTNERS && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <PartenairesAccueil token={token} />
                </div>
              )}
            </Fragment>
          ))}

          {list.loadingMore && <PostSkeleton count={1} />}

          {!list.hasMore && !list.loadingMore && (
            <p className="py-6 text-center text-sm text-slate-400">
              Vous avez vu tous les projets pour le moment.
            </p>
          )}
        </div>
      )}

      <div ref={sentinel} className="h-px" />

      {list.error && list.posts.length > 0 && (
        <button
          onClick={list.loadMore}
          className="mx-auto mt-2 flex items-center gap-2 text-sm font-semibold text-orange-700 hover:underline"
        >
          {list.loadingMore ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RotateCcw size={14} />
          )}
          Réessayer le chargement
        </button>
      )}

      {openedPost && (
        <CommentsModal
          post={openedPost}
          onClose={() => setCommentsPostId(null)}
          onUpdate={(patch) => list.updatePost(openedPost.id, patch)}
          onDeleted={list.removePost}
        />
      )}
    </section>
  );
});

export default Feed;
