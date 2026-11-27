"use client";

// Emplacement : app/communaute/components/post/PostHeader.tsx
// En-tête d'un projet : photo, nom, profession (ou domaine), date, bouton Collaborer, menu ⋯

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Flag, MoreHorizontal, Trash2, UserPlus, Pencil } from "lucide-react";
import apifile from "@/app/lib/apifile";
import domaines from "@/domaines.json";
import CollaborationRequestModal from "@/app/collaborateurs/components/CollaborationRequestModal";
import Avatar from "@/app/communaute/components/common/Avatar";
import ExpandableText from "@/app/communaute/components/common/ExpandableText";
import type { Post } from "@/app/communaute/lib/Types";

export default function PostHeader({
  post,
  onEdit,
  onDelete,
  onReport,
  onCollabSent,
}: {
  post: Post;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onCollabSent: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collabOpen, setCollabOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { auteur } = post;

  // Profession, sinon domaine principal, sinon valeur par défaut
  const domaine = (domaines as any[]).find(
    (d) => d.id == auteur.domaine_id,
  )?.nom;
  const profession = auteur.profession?.trim() || domaine || "Innovateur";

  useEffect(() => {
    if (!menuOpen) return;
    const outside = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [menuOpen]);

  const avatarUrl = auteur.pp
    ? `${apifile}/${auteur.pp}`
    : "/assets/images/pp2.png";

  return (
    <div className="flex items-start gap-3">
      <Link href={`/profil-talent/${auteur.id}`} className="shrink-0">
        <Avatar pp={auteur.pp} name={auteur.nom_complet} size={44} />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`/profil-talent/${auteur.id}`}
          className="block font-bold text-slate-900 hover:underline"
        >
          <ExpandableText lines={1} className="text-[15px] leading-tight">
            {auteur.nom_complet}
          </ExpandableText>
        </Link>
        <ExpandableText
          lines={1}
          className="text-xs leading-snug text-slate-500"
        >
          {profession}
        </ExpandableText>
        <p className="mt-0.5 text-xs text-slate-400" title={post.created_at}>
          {post.il_y_a}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {post.peut_collaborer && (
          <button
            onClick={() => setCollabOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-orange-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-800 active:scale-95"
          >
            <UserPlus size={14} />
            Collaborer
          </button>
        )}

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Options"
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <MoreHorizontal size={20} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-30 mt-1 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
              {!post.est_auteur && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onReport();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <Flag size={16} /> Signaler le projet
                </button>
              )}

              {post.peut_modifier && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <Pencil size={16} /> Modifier le projet
                </button>
              )}

              {post.peut_supprimer && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={16} /> Supprimer le projet
                </button>
              )}
              {post.est_auteur && !post.peut_supprimer && (
                <p className="px-4 py-2.5 text-sm text-slate-400">
                  Aucune action
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <CollaborationRequestModal
        open={collabOpen}
        onClose={() => setCollabOpen(false)}
        recipientId={auteur.id}
        name={auteur.nom_complet}
        avatarUrl={avatarUrl}
        onSent={onCollabSent}
      />
    </div>
  );
}
