"use client";

// Emplacement : app/components/pwa/PushOptInModal.tsx
// Modale d'invitation aux notifications. Affichée UNE SEULE FOIS, uniquement :
//   - utilisateur connecté
//   - notifications possibles sur cet appareil et pas encore activées POUR CE COMPTE
//     (sur iPhone, cela suppose l'app installée : le navigateur seul ne les supporte pas)
//   - modale jamais vue par ce compte (une fois par compte, mémorisé sur l'appareil)
//   - aucune autre modale prioritaire ouverte (prop "blocked", ex. région / ville)
// Un refus ferme la modale pour toujours, mais le bouton de la barre reste disponible.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Clock, Rocket, Users } from "lucide-react";
import toast from "react-hot-toast";
import RingingBell from "./RingingBell";
import { usePwa } from "./PwaProvider";

const SHOW_DELAY_MS = 4000; // laisse la page se stabiliser avant d'afficher la modale

// ⚠️ N'affichez ici que des notifications que vous envoyez réellement.
// Supprimez une ligne tant que la notification correspondante n'existe pas.
const BENEFITS = [
  {
    icon: Rocket,
    title: "Nouveaux challenges",
    text: "Soyez alerté dès la publication d'un challenge ou d'un hackathon dans votre domaine.",
  },
  {
    icon: Users,
    title: "Demandes de collaboration",
    text: "Sachez immédiatement quand quelqu'un souhaite collaborer avec vous.",
  },
  {
    icon: Clock,
    title: "Dates à ne pas manquer",
    text: "Recevez un rappel avant la clôture des challenges qui vous concernent.",
  },
];

export default function PushOptInModal({
  isLoggedIn,
  blocked = false,
}: {
  isLoggedIn: boolean;
  /** true tant qu'une autre modale prioritaire est affichée (ex. région / ville) */
  blocked?: boolean;
}) {
  const { ready, accountPush, modalSeen, setModalSeen, activatePush } =
    usePwa();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  const eligible =
    isLoggedIn &&
    ready &&
    accountPush === "needs-activation" &&
    !modalSeen &&
    !blocked;

  // Affichage différé. On mémorise "vue" au moment de l'affichage : jamais deux fois.
  useEffect(() => {
    if (!eligible) return;
    const timer = setTimeout(() => {
      setModalSeen(true);
      setOpen(true);
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [eligible, setModalSeen]);

  // Si une modale prioritaire apparaît pendant l'affichage (ou déconnexion) :
  // on s'efface sans "consommer" l'unique affichage, il reviendra plus tard.
  useEffect(() => {
    if (open && (blocked || !isLoggedIn)) {
      setOpen(false);
      setModalSeen(false);
    }
  }, [open, blocked, isLoggedIn, setModalSeen]);

  // Ferme simplement la modale : elle est déjà marquée "vue", donc elle ne reviendra plus.
  // Le bouton « Activer les notifications » de la barre reste disponible.
  const decline = () => setOpen(false);

  // Échap = refus + blocage du scroll de la page derrière
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") decline();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const accept = async () => {
    setLoading(true);
    const result = await activatePush();
    setLoading(false);

    if (result === "granted") {
      toast.success("Notifications activées !");
      setOpen(false);
    } else if (result === "denied" || result === "unsupported") {
      setOpen(false); // le statut passe à "denied" : le bouton de la barre disparaît tout seul
    } else if (result === "error") {
      toast.error("Activation impossible pour le moment. Réessayez plus tard.");
    }
    // "dismissed" : fenêtre du navigateur fermée sans choisir → la modale reste ouverte
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
            onClick={decline}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="push-optin-title"
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[2rem] bg-white shadow-2xl"
          >
            {/* En-tête */}
            <div className="bg-gradient-to-br from-orange-700 to-orange-600 px-6 pb-7 pt-9 text-center text-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
                <RingingBell size={30} />
              </div>
              <h2
                id="push-optin-title"
                className="text-xl font-extrabold leading-tight sm:text-2xl"
              >
                Soyez parmi les premiers informés
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-orange-50/90">
                Les meilleures opportunités partent vite. Activez les
                notifications pour ne plus rien manquer.
              </p>
            </div>

            {/* Contenu */}
            <div className="px-6 pb-6 pt-6">
              <ul className="space-y-4">
                {BENEFITS.map((b) => (
                  <li key={b.title} className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                      <b.icon size={20} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900">
                        {b.title}
                      </p>
                      <p className="text-[13px] leading-snug text-gray-500">
                        {b.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Action principale, mise en avant */}
              <button
                type="button"
                onClick={accept}
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-700 py-4 text-base font-bold text-white shadow-lg shadow-orange-700/25 transition hover:bg-orange-800 active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Bell size={18} />
                )}
                {loading ? "Activation..." : "Activer les notifications"}
              </button>

              {/* Refus, volontairement discret */}
              <button
                type="button"
                onClick={decline}
                className="mt-3 w-full py-2 text-xs font-medium text-gray-600 transition hover:text-gray-800"
              >
                Non merci
              </button>

              <p className="mt-1 text-center text-[11px] leading-snug text-gray-500">
                Quelques notifications utiles, jamais de spam. Désactivables à
                tout moment depuis les réglages de votre navigateur.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
