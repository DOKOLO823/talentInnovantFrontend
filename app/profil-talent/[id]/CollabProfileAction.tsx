"use client";

// Emplacement : app/profil-talent/[id]/CollabProfileAction.tsx (à côté de ProfileClient)
// Bouton « Collaborer » du profil, réservé aux talents (pas aux entreprises, pas au
// propriétaire du profil). Affiche l'état de la relation et ouvre la même fenêtre
// que la carte talent.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Clock, MessageSquare, UserPlus } from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import CollaborationRequestModal from "@/app/collaborateurs/components/CollaborationRequestModal";

type Etat = "loading" | "none" | "active" | "sent" | "received";

export default function CollabProfileAction({
  talentId,
  name,
  avatar,
  available = true,
}: {
  talentId: number | string;
  name?: string;
  avatar: string; // URL complète
  available?: boolean;
}) {
  const [etat, setEtat] = useState<Etat>("loading");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setEtat("loading");

    apiFetch(`/reseau/collaborations/statut/${talentId}`, { method: "GET" })
      .then((res: any) => {
        if (cancelled) return;
        const e = res?.etat;
        setEtat(
          res?.statut === 200 && ["active", "sent", "received"].includes(e)
            ? e
            : "none",
        );
      })
      .catch(() => {
        if (!cancelled) setEtat("none"); // le serveur contrôle de toute façon l'envoi
      });

    return () => {
      cancelled = true;
    };
  }, [talentId]);

  const pill =
    "inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg border text-sm font-semibold";

  if (etat === "loading") {
    return <div className="h-10 w-40 rounded-lg bg-slate-200 animate-pulse" />;
  }

  if (etat === "active") {
    return (
      <div className={`${pill} bg-green-50 text-green-700 border-green-100`}>
        <Check size={16} /> Vous êtes collaborateurs
      </div>
    );
  }

  if (etat === "sent") {
    return (
      <div className={`${pill} bg-orange-50 text-orange-700 border-orange-100`}>
        <Clock size={16} /> Demande envoyée · en attente
      </div>
    );
  }

  if (etat === "received") {
    return (
      <Link
        href="/reseau"
        className={`${pill} bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 transition`}
      >
        <MessageSquare size={16} /> Cette personne vous a envoyé une demande
      </Link>
    );
  }

  return (
    <>
      <button
        disabled={!available}
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg shadow text-sm font-semibold transition ${
          available
            ? "bg-orange-700 text-white hover:bg-orange-800 active:scale-95"
            : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
        }`}
      >
        <UserPlus size={18} /> {available ? "Collaborer" : "Indisponible"}
      </button>

      <CollaborationRequestModal
        open={open}
        onClose={() => setOpen(false)}
        recipientId={Number(talentId)}
        name={name}
        avatarUrl={avatar}
        onSent={() => setEtat("sent")}
      />
    </>
  );
}
