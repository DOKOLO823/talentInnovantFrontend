"use client";

// Emplacement : app/components/pwa/PwaBar.tsx
// Dans la navbar, AVANT le <nav> (et non à l'intérieur) :
//   <PwaBar isLoggedIn={pwaActive} userId={userId} onHeightChange={setPwaBarHeight} />
//
// La barre est dans le flux normal de la page (elle n'est PAS fixe) : elle prend sa place,
// pousse le contenu vers le bas, et disparaît avec le défilement. La navbar, elle, reste
// collée en haut une fois la barre sortie de l'écran (voir le calcul de `top` dans la navbar).
//
// Affiche UNE seule action à la fois, centrée, uniquement si l'utilisateur est connecté :
//   1. « Activer les notifications » (prioritaire) : visible tant que CE COMPTE ne les a pas
//      activées. Disparaît dès qu'elles sont activées, ou si le navigateur les bloque.
//   2. « Installer l'application » : ensuite. Sur iPhone, l'installation est le préalable
//      aux notifications : elle est donc proposée en premier, présentée comme telle.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, X } from "lucide-react";
import toast from "react-hot-toast";
import { usePwa } from "./PwaProvider";
import RingingBell from "./RingingBell";
import { syncPushSubscription } from "@/app/lib/push";

const SYNC_KEY = "ti_push_synced";

const buttonClass =
  "inline-flex items-center gap-2 rounded-full bg-orange-700 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-orange-800 active:scale-95 disabled:opacity-60";

export default function PwaBar({
  isLoggedIn,
  userId,
  onHeightChange,
}: {
  isLoggedIn: boolean;
  userId: number | string | null;
  /** Hauteur actuelle de la barre en px (0 quand elle est absente) */
  onHeightChange?: (height: number) => void;
}) {
  const {
    ready,
    installed,
    canInstall,
    isIos,
    installDismissed,
    accountId,
    accountPush,
    setAccount,
    promptInstall,
    dismissInstall,
    activatePush,
    refreshPush,
  } = usePwa();
  const [loading, setLoading] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  // Rattache l'état PWA au compte actuellement connecté
  useEffect(() => {
    setAccount(isLoggedIn && userId != null ? String(userId) : null);
  }, [isLoggedIn, userId, setAccount]);

  // Compte déjà activé : une fois par session, on rattache l'appareil à CE compte
  // (utile après une déconnexion / reconnexion, ou si un autre compte l'utilisait).
  useEffect(() => {
    if (!isLoggedIn) {
      try {
        Object.keys(sessionStorage)
          .filter((k) => k.startsWith(SYNC_KEY))
          .forEach((k) => sessionStorage.removeItem(k));
      } catch {}
      return;
    }
    if (!ready || !accountId || accountPush !== "active") return;

    const key = `${SYNC_KEY}_${accountId}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {}

    syncPushSubscription().then((ok) => {
      if (ok) {
        try {
          sessionStorage.setItem(key, "1");
        } catch {}
      }
      refreshPush();
    });
  }, [isLoggedIn, ready, accountId, accountPush, refreshPush]);

  // Priorité aux notifications. L'installation n'est proposée qu'ensuite
  // (notifications activées ou bloquées) ou quand elle est le préalable aux notifications (iPhone).
  const canShow = isLoggedIn && ready && !!accountId;
  const showPush = canShow && accountPush === "needs-activation";
  const showInstall =
    canShow &&
    !showPush &&
    !installed &&
    !installDismissed &&
    (canInstall || isIos);
  const visible = showPush || showInstall;

  // Communique la hauteur de la barre à la navbar (pour positionner celle-ci juste dessous)
  useEffect(() => {
    const el = barRef.current;
    if (!visible || !el) {
      onHeightChange?.(0);
      return;
    }
    const report = () => onHeightChange?.(el.offsetHeight);
    report();
    const observer = new ResizeObserver(report);
    observer.observe(el);
    return () => {
      observer.disconnect();
      onHeightChange?.(0);
    };
  }, [visible, onHeightChange]);

  if (!visible) return null;

  const handleActivate = async () => {
    setLoading(true);
    const result = await activatePush();
    setLoading(false);

    if (result === "granted") toast.success("Notifications activées !");
    else if (result === "error")
      toast.error("Activation impossible pour le moment. Réessayez plus tard.");
  };

  return (
    <motion.div
      ref={barRef}
      initial={{ height: 0 }}
      animate={{ height: "auto" }}
      transition={{ duration: 0.2 }}
      className="w-full overflow-hidden border-b border-orange-100 bg-orange-50"
    >
      <div className="flex w-full items-center justify-center gap-2 px-3 py-1.5 sm:gap-3">
        {showInstall && canInstall && (
          <>
            <span className="hidden text-xs font-medium text-gray-700 sm:inline">
              Accédez à Talent Innovant en un clic
            </span>
            <button onClick={promptInstall} className={buttonClass}>
              <Download size={14} /> Installer l'application
            </button>
          </>
        )}

        {showInstall && !canInstall && isIos && (
          <span className="text-center text-xs font-medium text-gray-700">
            Pour recevoir les notifications : touchez <b>Partager</b>, puis{" "}
            <b>« Sur l'écran d'accueil »</b>
          </span>
        )}

        {showInstall && (
          <button
            onClick={dismissInstall}
            aria-label="Masquer"
            className="rounded-full p-1 text-gray-400 transition hover:bg-orange-100 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}

        {showPush && (
          <>
            <span className="hidden text-xs font-medium text-gray-700 sm:inline">
              Soyez alerté des nouvelles opportunités
            </span>
            <button
              onClick={handleActivate}
              disabled={loading}
              className={buttonClass}
            >
              <RingingBell size={14} />
              {loading ? "Activation..." : "Activer les notifications"}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
