"use client";

// Emplacement : app/communaute/components/comments/PostDetailView.tsx
// Le projet + ses commentaires. Identique dans la fenêtre (X) et dans la page de détail (bouton Retour).

import { useRef } from "react";
import PostCard from "../../post/PostCard";
import CommentsPanel from "./CommentsPanel";
import type { Post } from "../../lib/Types";

export default function PostDetailView({
  post,
  onUpdate,
  onDeleted,
  composerOffsetClass,
}: {
  post: Post;
  onUpdate: (patch: Partial<Post>) => void;
  onDeleted: (id: number) => void;
  composerOffsetClass?: string;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const focusComposer = () => {
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    inputRef.current?.focus();
  };

  return (
    <div className="bg-white">
      <PostCard
        post={post}
        onUpdate={onUpdate}
        onDeleted={onDeleted}
        onComment={focusComposer}
        className="rounded-none border-0 shadow-none"
      />
      <div className="h-2 bg-slate-100" />
      <CommentsPanel
        postId={post.id}
        inputRef={inputRef}
        composerOffsetClass={composerOffsetClass}
        onCountChange={(delta) =>
          onUpdate({ commentaires_count: post.commentaires_count + delta })
        }
      />
    </div>
  );
}
