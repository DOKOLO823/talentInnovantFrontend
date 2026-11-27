"use client";

// Compteurs (réactions, commentaires, partages) + boutons J'aime / Commenter / Partager.

import { useState } from "react";
import { MessageCircle, Share2 } from "lucide-react";
import ReactionButton from "../components/reactions/ReactionButton";
import ReactionSummary from "../components/reactions/ReactionSummary";
import ReactionUsersModal from "../components/reactions/ReactionUsersModal";
import { useReaction } from "../lib/useReaction";
import type { ReactionType } from "../lib/Constants";
import type { Post, ReactionState } from "../lib/Types";

export default function PostActions({
  post,
  onChange,
  onComment,
  onShare,
}: {
  post: Post;
  onChange: (patch: Partial<Post>) => void;
  onComment: () => void;
  onShare: () => void;
}) {
  const [usersType, setUsersType] = useState<ReactionType | null>(null);

  const state: ReactionState = {
    ma_reaction: post.ma_reaction,
    reactions_count: post.reactions_count,
    reactions_resume: post.reactions_resume,
  };

  const { react } = useReaction(
    state,
    (next) => onChange(next),
    `/communaute/posts/${post.id}/reaction`,
  );

  const hasCounts =
    post.reactions_count > 0 ||
    post.commentaires_count > 0 ||
    post.partages_count > 0;

  return (
    <div>
      {hasCounts && (
        <div className="flex items-center justify-between px-4 py-2.5">
          <ReactionSummary
            resume={post.reactions_resume}
            count={post.reactions_count}
            onOpen={setUsersType}
          />
          <div className="ml-auto flex items-center gap-3 text-sm text-slate-500">
            {post.commentaires_count > 0 && (
              <button onClick={onComment} className="hover:underline">
                {post.commentaires_count} commentaire
                {post.commentaires_count > 1 ? "s" : ""}
              </button>
            )}
            {post.partages_count > 0 && (
              <span>
                {post.partages_count} partage
                {post.partages_count > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mx-3 grid grid-cols-3 border-t border-slate-100 py-1">
        <ReactionButton
          current={post.ma_reaction}
          onReact={react}
          className="w-full rounded-lg py-2.5 hover:bg-slate-50"
        />
        <button
          onClick={onComment}
          className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <MessageCircle size={18} /> Commenter
        </button>
        <button
          onClick={onShare}
          className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <Share2 size={18} /> Partager
        </button>
      </div>

      {usersType && (
        <ReactionUsersModal
          postId={post.id}
          initialType={usersType}
          resume={post.reactions_resume}
          onClose={() => setUsersType(null)}
        />
      )}
    </div>
  );
}
