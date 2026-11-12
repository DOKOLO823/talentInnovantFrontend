"use client";

// Emplacement : app/components/pwa/PwaProvider.tsx
// Enregistre le service worker ET centralise l'état PWA.
// Les notifications sont gérées PAR COMPTE : chaque compte a son propre choix
// (activé / pas encore), mémorisé sur l'appareil, sans effet sur les autres comptes.
//
// Une seule activation à la fois pour toute l'application (barre ET modale) :
//   - un double clic, ou un clic sur la barre pendant que la modale s'ouvre, ne lance qu'UNE activation
//   - dès que l'utilisateur s'engage dans l'activation, la modale n'apparaît plus jamais pour ce compte

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  enablePush,
  getPushStatus,
  getServerPushStatus,
  syncPushSubscription,
  type EnableResult,
  type PushStatus,
} from "@/app/lib/push";

// Clés du localStorage (propres à cet appareil / navigateur)
const KEYS = {
  installDismissed: "ti_install_dismissed_at", // bandeau d'installation fermé (date)
  optIn: (id: string) => `ti_push_optin_${id}`, // ce compte a activé les notifications
  modalSeen: (id: string) => `ti_push_modal_seen_${id}`, // modale déjà vue / activation déjà tentée
};
const INSTALL_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

// localStorage peut être indisponible (navigation privée, Safari) : on protège tout
const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};
const remove = (k: string) => {
  try {
    localStorage.removeItem(k);
  } catch {}
};

/**
 * unsupported      : appareil / navigateur incompatible
 * denied           : bloqué dans le navigateur
 * checking         : vérification auprès du serveur en cours (rien n'est affiché)
 * needs-activation : ce COMPTE n'a pas (encore) activé les notifications
 * active           : ce compte a activé les notifications
 */
export type AccountPushStatus =
  | "unsupported"
  | "denied"
  | "checking"
  | "needs-activation"
  | "active";

interface PwaContextValue {
  ready: boolean;
  installed: boolean;
  canInstall: boolean;
  isIos: boolean;
  installDismissed: boolean;
  pushStatus: PushStatus; // état brut de l'appareil
  accountId: string | null;
  accountPush: AccountPushStatus; // état pour le compte connecté
  modalSeen: boolean; // pour le compte connecté
  activating: boolean; // une activation est en cours (barre ou modale)
  isBusy: () => boolean; // idem, lisible sans attendre un rendu (anti-collision)
  setAccount: (id: string | null) => void;
  promptInstall: () => Promise<void>;
  dismissInstall: () => void;
  activatePush: () => Promise<EnableResult>;
  setModalSeen: (value: boolean) => void;
  refreshPush: () => Promise<void>;
}

const PwaContext = createContext<PwaContextValue | null>(null);

export function usePwa() {
  const ctx = useContext(PwaContext);
  if (!ctx) throw new Error("usePwa doit être utilisé dans <PwaProvider>");
  return ctx;
}

export default function PwaProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installDismissed, setInstallDismissed] = useState(false);
  const [pushStatus, setPushStatus] = useState<PushStatus>("unsupported");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [flagsVersion, setFlagsVersion] = useState(0); // force la relecture des drapeaux
  const [adoptChecked, setAdoptChecked] = useState<string | null>(null); // compte déjà vérifié auprès du serveur
  const [activating, setActivating] = useState(false);
  const activationRef = useRef<Promise<EnableResult> | null>(null);

  const refreshPush = useCallback(async () => {
    setPushStatus(await getPushStatus());
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(console.error);
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    setInstalled(standalone);
    setIsIos(
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
    );

    const dismissedAt = Number(read(KEYS.installDismissed) || 0);
    setInstallDismissed(
      dismissedAt > 0 && Date.now() - dismissedAt < INSTALL_SNOOZE_MS,
    );

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    refreshPush().finally(() => setReady(true));

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [refreshPush]);

  // Drapeaux du compte connecté, relus dès que le compte change (pas de flash d'un autre compte)
  const optIn = useMemo(
    () => !!accountId && read(KEYS.optIn(accountId)) === "1",
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountId, flagsVersion],
  );
  const modalSeen = useMemo(
    () => !!accountId && read(KEYS.modalSeen(accountId)) === "1",
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountId, flagsVersion],
  );

  // L'appareil a déjà l'autorisation du navigateur mais ce compte n'a pas de drapeau local
  // (ex. application installée dont le stockage ou l'abonnement est séparé de celui du navigateur) :
  // on interroge le serveur avant de rien afficher, pour ne pas redemander ce qui est déjà fait.
  const needsCheck =
    ready &&
    !!accountId &&
    !optIn &&
    (pushStatus === "subscribed" || pushStatus === "granted") &&
    adoptChecked !== accountId;

  const accountPush: AccountPushStatus = useMemo(() => {
    if (pushStatus === "unsupported") return "unsupported";
    if (pushStatus === "denied") return "denied";
    if (optIn && (pushStatus === "granted" || pushStatus === "subscribed"))
      return "active";
    if (needsCheck) return "checking";
    return "needs-activation";
  }, [pushStatus, optIn, needsCheck]);

  useEffect(() => {
    if (!needsCheck || !accountId) return;
    let cancelled = false;

    (async () => {
      const status = await getServerPushStatus();
      let adopt = !!status?.subscribed; // le serveur connaît déjà cet appareil pour ce compte

      // Autorisation déjà accordée sur cet appareil ET compte déjà activé sur un appareil :
      // on enregistre celui-ci sans rien demander (ex. application installée avec son propre
      // abonnement). Il est retiré du compte à la déconnexion.
      if (!adopt && pushStatus === "granted" && (status?.count ?? 0) > 0) {
        adopt = await syncPushSubscription();
      }

      if (cancelled) return;
      if (adopt) {
        write(KEYS.optIn(accountId), "1");
        write(KEYS.modalSeen(accountId), "1"); // inutile de le solliciter
        setFlagsVersion((v) => v + 1);
      }
      setAdoptChecked(accountId);
      if (adopt) await refreshPush();
    })();

    return () => {
      cancelled = true;
    };
  }, [needsCheck, accountId, pushStatus, refreshPush]);

  const setAccount = useCallback((id: string | null) => {
    setAccountId((prev) => (prev === id ? prev : id));
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const dismissInstall = useCallback(() => {
    write(KEYS.installDismissed, String(Date.now()));
    setInstallDismissed(true);
  }, []);

  const isBusy = useCallback(() => activationRef.current !== null, []);

  const setModalSeen = useCallback(
    (value: boolean) => {
      if (!accountId) return;
      // Une fois l'utilisateur engagé dans l'activation, on ne « dé-marque » jamais la modale
      if (!value && activationRef.current) return;
      if (value) write(KEYS.modalSeen(accountId), "1");
      else remove(KEYS.modalSeen(accountId));
      setFlagsVersion((v) => v + 1);
    },
    [accountId],
  );

  // UNE seule activation à la fois (barre ou modale). Si l'appareil a déjà l'autorisation du
  // navigateur (autre compte), aucune fenêtre n'apparaît : le compte est simplement activé.
  const activatePush = useCallback((): Promise<EnableResult> => {
    if (activationRef.current) return activationRef.current; // déjà en cours : même résultat

    // L'utilisateur s'engage : la modale n'a plus besoin d'apparaître pour ce compte
    if (accountId) {
      write(KEYS.modalSeen(accountId), "1");
      setFlagsVersion((v) => v + 1);
    }
    setActivating(true);

    const run = (async () => {
      try {
        const result = await enablePush();
        if (result === "granted" && accountId) {
          write(KEYS.optIn(accountId), "1");
        }
        await refreshPush();
        setFlagsVersion((v) => v + 1);
        return result;
      } finally {
        activationRef.current = null;
        setActivating(false);
      }
    })();

    activationRef.current = run;
    return run;
  }, [accountId, refreshPush]);

  const value = useMemo<PwaContextValue>(
    () => ({
      ready,
      installed,
      canInstall: !!deferredPrompt,
      isIos,
      installDismissed,
      pushStatus,
      accountId,
      accountPush,
      modalSeen,
      activating,
      isBusy,
      setAccount,
      promptInstall,
      dismissInstall,
      activatePush,
      setModalSeen,
      refreshPush,
    }),
    [
      ready,
      installed,
      deferredPrompt,
      isIos,
      installDismissed,
      pushStatus,
      accountId,
      accountPush,
      modalSeen,
      activating,
      isBusy,
      setAccount,
      promptInstall,
      dismissInstall,
      activatePush,
      setModalSeen,
      refreshPush,
    ],
  );

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}
