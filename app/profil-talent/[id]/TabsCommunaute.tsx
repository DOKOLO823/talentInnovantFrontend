"use client";

// Emplacement : app/profil-talent/[id]/TabsCommunaute.tsx
// Projets que ce talent a partagés dans la communauté.

import { useState } from "react";
import Link from "next/link";
import { FolderOpen, Loader2, RotateCcw } from "lucide-react";
import PostCard from "@/app/communaute/post/PostCard";
import CommentsModal from "@/app/communaute/components/comments/CommentsModal";
import { PostSkeleton } from "@/app/communaute/components/common/Skeletons";
import { usePostList } from "@/app/communaute/hooks/usePostList";

export default function TabsCommunaute({
  userId,
  currentUser,
  isOwner,
}: {
  userId: string;
  currentUser: any;
  isOwner: boolean;
}) {
  const [commentsPostId, setCommentsPostId] = useState<number | null>(null);
  const list = usePostList(
    `/communaute/talents/${userId}/posts`,
    {},
    !!currentUser,
  );
  const openedPost = list.posts.find((p) => p.id === commentsPostId) ?? null;

  if (!currentUser) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 p-10 text-center">
        <p className="mb-5 font-bold text-black">
          Connectez-vous pour voir les projets partagés dans la communauté.
        </p>
        <Link
          href="/auth/login"
          className="inline-block rounded-full bg-orange-700 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-800"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[680px]">
      <h2 className="mb-5 border-l-4 border-orange-700 pl-3 text-sm text-gray-800 md:text-base">
        Projets partagés dans la communauté :
      </h2>

      {list.loading ? (
        <PostSkeleton count={2} />
      ) : list.error && list.posts.length === 0 ? (
        <div className="py-12 text-center">
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
        <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-16 text-center">
          <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
            <FolderOpen className="text-gray-300" size={40} />
          </div>
          <h3 className="font-bold text-gray-900">Aucun projet partagé</h3>
          <p className="mt-2 max-w-xs text-sm text-gray-500">
            {isOwner
              ? "Vous n'avez pas encore partagé de projet dans la communauté."
              : "Ce talent n'a pas encore partagé de projet dans la communauté."}
          </p>
          {isOwner && (
            <Link
              href="/communaute"
              className="mt-5 rounded-full bg-orange-700 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-800"
            >
              Partager un projet
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {list.posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onUpdate={(patch) => list.updatePost(post.id, patch)}
              onDeleted={list.removePost}
              onComment={() => setCommentsPostId(post.id)}
            />
          ))}

          {list.hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={list.loadMore}
                disabled={list.loadingMore}
                className="flex items-center gap-2 rounded-xl border border-orange-700 bg-white px-8 py-3 text-sm font-bold text-orange-700 transition hover:bg-orange-700 hover:text-white disabled:opacity-70"
              >
                {list.loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Chargement...
                  </>
                ) : (
                  "Charger plus de projets"
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {openedPost && (
        <CommentsModal
          post={openedPost}
          onClose={() => setCommentsPostId(null)}
          onUpdate={(patch) => list.updatePost(openedPost.id, patch)}
          onDeleted={list.removePost}
        />
      )}
    </div>
  );
}
