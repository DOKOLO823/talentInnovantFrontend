"use client";

// Emplacement : app/components/pwa/PushOptInModal.tsx
// Invitation courte à activer les notifications. Affichée UNE SEULE FOIS par compte, uniquement si :
//   - l'utilisateur est CONNECTÉ (jamais pour un visiteur) et son rôle est connu
//   - les notifications sont possibles sur l'appareil et pas encore activées pour ce compte
//   - le compte n'a jamais vu cette modale ni cliqué sur « Activer les notifications » dans la barre
//   - aucune autre modale prioritaire n'est ouverte (prop "blocked", ex. région / ville)
//   - aucune activation n'est en cours (clic sur la barre au même moment : pas de collision)
// Texte selon le rôle (talent / entreprise) : voir pwaCopy.ts.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, X } from "lucide-react";
import toast from "react-hot-toast";
import RingingBell from "./RingingBell";
import { usePwa } from "./PwaProvider";
import { getPushCopy } from "./pwaCopy";
import { getLastPushError } from "@/app/lib/push";

const SHOW_DELAY_MS = 4000; // laisse la page se stabiliser avant d'afficher la modale

export default function PushOptInModal({
  isLoggedIn,
  role,
  blocked = false,
}: {
  isLoggedIn: boolean;
  role?: string;
  /** true tant qu'une autre modale prioritaire est affichée (ex. région / ville) */
  blocked?: boolean;
}) {
  const {
    ready,
    accountPush,
    modalSeen,
    activating,
    isBusy,
    setModalSeen,
    activatePush,
  } = usePwa();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const copy = getPushCopy(role);

  useEffect(() => setMounted(true), []);

  const eligible =
    isLoggedIn &&
    (role === "talent" || role === "entreprise") &&
    ready &&
    accountPush === "needs-activation" &&
    !modalSeen &&
    !blocked &&
    !activating;

  // Affichage différé. On mémorise « vue » au moment de l'affichage : jamais deux fois.
  useEffect(() => {
    if (!eligible) return;
    const timer = setTimeout(() => {
      // Un clic sur « Activer » (barre) vient de démarrer : on ne s'impose pas par-dessus
      if (isBusy()) return;
      setModalSeen(true);
      setOpen(true);
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [eligible, isBusy, setModalSeen]);

  // Une autre modale prioritaire apparaît (ou déconnexion) : on s'efface sans consommer
  // l'unique affichage. Sans effet si l'utilisateur s'est déjà engagé dans l'activation.
  useEffect(() => {
    if (open && (blocked || !isLoggedIn)) {
      setOpen(false);
      setModalSeen(false);
    }
  }, [open, blocked, isLoggedIn, setModalSeen]);

  // L'état du compte a changé pendant l'affichage (activé, bloqué, adopté) : on ferme proprement
  useEffect(() => {
    if (open && !activating && accountPush !== "needs-activation") {
      setOpen(false);
    }
  }, [open, activating, accountPush]);

  const close = () => setOpen(false); // déjà marquée « vue » : elle ne reviendra plus

  // Échap = fermer + blocage du scroll de la page derrière
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const accept = async () => {
    const result = await activatePush(); // une seule activation à la fois, même avec la barre
    if (result === "granted") {
      toast.success("Notifications activées !");
      setOpen(false);
    } else if (result === "denied" || result === "unsupported") {
      setOpen(false); // le statut passe à « denied » : le bouton de la barre disparaît tout seul
    } else if (result === "error") {
      toast.error(
        `Activation impossible : ${getLastPushError() || "raison inconnue"}`,
        { duration: 8000 },
      );
    }
    // « dismissed » : fenêtre du navigateur fermée sans choisir → la modale reste ouverte
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="push-optin-title"
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-3xl bg-white px-6 pb-6 pt-8 text-center shadow-2xl"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Fermer"
              className="absolute right-3 top-3 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
              <RingingBell size={28} />
            </div>

            <h2
              id="push-optin-title"
              className="text-lg font-extrabold leading-tight text-gray-900 sm:text-xl"
            >
              {copy.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              {copy.text}
            </p>

            <button
              type="button"
              onClick={accept}
              disabled={activating}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-700 py-3.5 text-base font-bold text-white shadow-lg shadow-orange-700/25 transition hover:bg-orange-800 active:scale-[0.98] disabled:opacity-70"
            >
              {activating ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Bell size={18} />
              )}
              {activating ? "Activation..." : "Activer les notifications"}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
