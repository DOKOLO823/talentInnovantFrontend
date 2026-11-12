// Emplacement : app/lib/push.ts

import { apiFetch } from "@/app/lib/api";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

/**
 * unsupported : navigateur incompatible (ex. iPhone hors app installée)
 * default     : jamais demandé
 * denied      : bloqué par l'utilisateur
 * granted     : autorisé mais aucun abonnement enregistré sur cet appareil
 * subscribed  : autorisé ET abonné
 */
export type PushStatus =
  | "unsupported"
  | "default"
  | "denied"
  | "granted"
  | "subscribed";

export type EnableResult =
  | "granted"
  | "denied"
  | "dismissed" // fenêtre du navigateur fermée sans choisir
  | "unsupported"
  | "error";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

const isSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

// Attend le service worker, mais sans bloquer indéfiniment s'il n'est pas prêt
async function getRegistration(
  timeoutMs = 5000,
): Promise<ServiceWorkerRegistration | null> {
  try {
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
  } catch {
    return null;
  }
}

export async function getPushStatus(): Promise<PushStatus> {
  if (!isSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  if (Notification.permission === "default") return "default";

  const reg = await getRegistration();
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  return sub ? "subscribed" : "granted";
}

// Crée l'abonnement si besoin puis l'enregistre côté Laravel (rattaché à l'utilisateur connecté)
async function subscribeAndSave(): Promise<boolean> {
  const reg = await getRegistration();
  if (!reg) return false;

  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));

  const res = await apiFetch("/push/subscribe", {
    method: "POST",
    body: JSON.stringify(sub.toJSON()),
  });
  return res?.statut === 200;
}

/** À appeler sur un clic : demande l'autorisation puis abonne l'appareil. */
export async function enablePush(): Promise<EnableResult> {
  if (!isSupported()) return "unsupported";

  const permission = await Notification.requestPermission();
  if (permission === "denied") return "denied";
  if (permission === "default") return "dismissed";

  try {
    return (await subscribeAndSave()) ? "granted" : "error";
  } catch (e) {
    console.error("Erreur d'abonnement push :", e);
    return "error";
  }
}

/**
 * Si l'autorisation est déjà accordée : ré-enregistre l'abonnement auprès de Laravel
 * pour le compte actuellement connecté (utile sur un appareil partagé, ou si
 * l'enregistrement avait échoué). Ne demande rien à l'utilisateur.
 */
export async function syncPushSubscription(): Promise<boolean> {
  if (!isSupported() || Notification.permission !== "granted") return false;
  try {
    return await subscribeAndSave();
  } catch (e) {
    console.error("Synchronisation push échouée :", e);
    return false;
  }
}

export async function disablePush() {
  if (!isSupported()) return;
  const reg = await getRegistration();
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  if (!sub) return;
  try {
    await apiFetch("/push/unsubscribe", {
      method: "POST",
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
  } finally {
    await sub.unsubscribe();
  }
}

/**
 * Déconnexion : l'appareil cesse de notifier le compte qui part (suppression de sa ligne
 * côté Laravel). L'abonnement du NAVIGATEUR est conservé : le même compte, ou un autre
 * qui a activé les notifications, sera rattaché à l'appareil à sa connexion, sans rien refaire.
 * À appeler AVANT de supprimer le jeton d'authentification (l'API en a besoin).
 */
export async function detachPushFromAccount(): Promise<void> {
  if (!isSupported() || Notification.permission !== "granted") return;
  try {
    await Promise.race([
      (async () => {
        const reg = await getRegistration(2000);
        const sub = reg ? await reg.pushManager.getSubscription() : null;
        if (!sub) return;
        await apiFetch("/push/unsubscribe", {
          method: "POST",
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      })(),
      // Ne bloque jamais la déconnexion plus de 3 secondes
      new Promise<void>((resolve) => setTimeout(resolve, 3000)),
    ]);
  } catch {
    // La déconnexion doit toujours aboutir
  }
}