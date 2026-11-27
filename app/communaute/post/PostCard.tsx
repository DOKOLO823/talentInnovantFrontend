"use client";

// Cadre d'un projet : en-tête, titre, description, lien, fichiers, actions, modification, suppression.

import { useState } from "react";
import { ExternalLink, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "@/app/lib/api";
import ExpandableText from "../components/common/ExpandableText";
import AddPostModal from "../components/AddPostModal";
import PostHeader from "./PostHeader";
import PostMedia from "./PostMedia";
import PostActions from "./PostActions";
import MediaViewerModal from "./MediaViewerModal";
import ShareModal from "./ShareModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import ReportModal from "./ReportModal";
import { apiErrorMessage, startProgressToast } from "../lib/notify";
import { updatePost, type NewPostData } from "../lib/postsApi";
import { useRequireAuth } from "../lib/useRequireAuth";
import type { Post } from "../lib/Types";

function LinkCard({ url }: { url: string }) {
  let host = url;
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {}

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:bg-slate-100"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
        <Link2 size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-800">
          {host}
        </span>
        <ExpandableText lines={1} className="text-xs text-slate-500 break-all">
          {url}
        </ExpandableText>
      </span>
      <ExternalLink size={16} className="shrink-0 text-slate-400" />
    </a>
  );
}

export default function PostCard({
  post,
  onUpdate,
  onDeleted,
  onComment,
  className = "",
}: {
  post: Post;
  onUpdate: (patch: Partial<Post>) => void;
  onDeleted: (id: number) => void;
  onComment: () => void;
  className?: string;
}) {
  const { requireAuth } = useRequireAuth();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await apiFetch(`/communaute/posts/${post.id}/supprimer`, {
        method: "POST",
      });
      if (res?.statut === 200) {
        setConfirmOpen(false);
        toast.success("Votre publication a été supprimée.");
        onDeleted(post.id);
      } else {
        toast.error(
          res?.message || "Impossible de supprimer cette publication.",
        );
      }
    } catch (e) {
      toast.error(
        apiErrorMessage(e, "Impossible de supprimer cette publication."),
      );
    } finally {
      setDeleting(false);
    }
  };

  // Modification en arrière-plan : la publication n'est mise à jour qu'après confirmation du serveur
  const handleEdit = async (data: NewPostData) => {
    const progress = startProgressToast("edit");
    try {
      const updated = await updatePost(post.id, data, progress.update);
      onUpdate(updated);
      progress.success();
    } catch (e: any) {
      progress.error(
        e?.message || "Une erreur est survenue lors de la modification.",
        () => handleEdit(data),
      );
    }
  };

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="px-4 pt-4">
        <PostHeader
          post={post}
          onEdit={() => setEditOpen(true)}
          onDelete={() => setConfirmOpen(true)}
          onReport={() =>
            requireAuth("Connectez-vous pour signaler un projet.") &&
            setReportOpen(true)
          }
          onCollabSent={() => onUpdate({ peut_collaborer: false })}
        />

        <div className="mt-3 space-y-2">
          <ExpandableText
            lines={2}
            className="text-base font-bold leading-snug text-slate-900 md:text-lg"
          >
            {post.titre}
          </ExpandableText>
          <ExpandableText
            lines={4}
            className="whitespace-pre-line text-[15px] leading-relaxed text-slate-700"
          >
            {post.description}
          </ExpandableText>
          {post.lien && <LinkCard url={post.lien} />}
        </div>
      </div>

      {post.fichiers.length > 0 && (
        <div className="mt-3">
          <PostMedia fichiers={post.fichiers} onOpen={setViewerIndex} />
        </div>
      )}

      <div className="mt-1">
        <PostActions
          post={post}
          onChange={onUpdate}
          onComment={onComment}
          onShare={() => setShareOpen(true)}
        />
      </div>

      {viewerIndex !== null && (
        <MediaViewerModal
          fichiers={post.fichiers}
          startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        postId={post.id}
        onShared={(count) => onUpdate({ partages_count: count })}
      />
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        postId={post.id}
      />
      <ConfirmDeleteModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />

      {post.peut_modifier && (
        <AddPostModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSubmit={handleEdit}
          post={post}
          zClass="z-[900]"
        />
      )}
    </article>
  );
}
