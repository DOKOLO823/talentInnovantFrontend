"use client";

// Emplacement : app/communaute/components/comments/CommentsModal.tsx
import ModalShell from "../common/ModalShell";
import PostDetailView from "./PostDetailView";
import type { Post } from "../../lib/Types";

export default function CommentsModal({
  post,
  onClose,
  onUpdate,
  onDeleted,
}: {
  post: Post;
  onClose: () => void;
  onUpdate: (patch: Partial<Post>) => void;
  onDeleted: (id: number) => void;
}) {
  return (
    <ModalShell
      open
      onClose={onClose}
      title={`Projet de ${post.auteur.nom_complet}`}
      panelClassName="sm:max-w-2xl sm:h-[92vh] h-[94vh]"
      zClass="z-[780]"
    >
      <PostDetailView
        post={post}
        onUpdate={onUpdate}
        onDeleted={(id) => {
          onDeleted(id);
          onClose();
        }}
      />
    </ModalShell>
  );
}
