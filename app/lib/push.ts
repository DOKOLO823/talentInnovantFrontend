// Emplacement : app/lib/push.ts

import { apiFetch } from "@/app/lib/api";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

// Raison de la dernière erreur d'activation (affichée dans le message d'erreur, utile pour
// diagnostiquer sur un téléphone où la console n'est pas accessible).
let lastError = "";
export const getLastPushError = () => lastError;
function fail(reason: string, detail?: unknown): false {
  lastError = reason;
  console.error("[push]", reason, detail ?? "");
  return false;
}

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
  timeoutMs = 10000, // un réseau mobile lent peut demander plusieurs secondes au 1er chargement
): Promise<ServiceWorkerRegistration | null> {
  try {
    // S'assure qu'un service worker est bien enregistré (sans effet s'il l'est déjà)
    const existing = await navigator.serviceWorker.getRegistration();
    if (!existing) {
      await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    }
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
  if (!VAPID_PUBLIC_KEY) return fail("clé VAPID absente du site");

  const reg = await getRegistration();
  if (!reg) return fail("service worker pas prêt (connexion lente ?)");

  const key = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

  let sub: PushSubscription | null = null;
  try {
    sub = await reg.pushManager.getSubscription();

    // Un ancien abonnement créé avec une AUTRE clé VAPID ne recevrait jamais rien :
    // on le supprime et on en recrée un avec la clé actuelle.
    if (sub) {
      const current = sub.options?.applicationServerKey;
      if (current) {
        const a = new Uint8Array(current);
        const same = a.length === key.length && a.every((v, i) => v === key[i]);
        if (!same) {
          await sub.unsubscribe();
          sub = null;
        }
      }
    }

    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      });
    }
  } catch (e) {
    return fail(`abonnement navigateur refusé : ${(e as Error)?.name ?? "erreur"}`, e);
  }

  try {
    const res = await apiFetch("/push/subscribe", {
      method: "POST",
      body: JSON.stringify(sub.toJSON()),
    });
    if (res?.statut === 200) return true;
    return fail(`serveur ${res?.statut ?? "?"} ${res?.message ?? ""}`.trim(), res);
  } catch (e) {
    return fail("serveur injoignable", e);
  }
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
    fail("erreur inattendue", e);
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

/* ------------------------- Statut serveur & diagnostic ------------------------- */

export interface ServerPushStatus {
  subscribed: boolean; // cet appareil est enregistré pour le compte connecté
  count: number; // nombre d'appareils enregistrés pour ce compte
  serverKey: string; // clé publique VAPID utilisée par Laravel
}

/** Demande à Laravel si l'abonnement de CET appareil appartient au compte connecté. */
export async function getServerPushStatus(): Promise<ServerPushStatus | null> {
  if (!isSupported()) return null;
  try {
    const reg = await getRegistration(4000);
    const sub = reg ? await reg.pushManager.getSubscription() : null;
    const res = await apiFetch("/push/status", {
      method: "POST",
      body: JSON.stringify({ endpoint: sub?.endpoint ?? null }),
    });
    if (res?.statut !== 200) return null;
    return {
      subscribed: !!res.subscribed,
      count: res.count ?? 0,
      serverKey: res.server_key ?? "",
    };
  } catch {
    return null;
  }
}

const toBase64Url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

export interface PushDiagnostics {
  supported: boolean;
  permission: string;
  serviceWorkerReady: boolean;
  hasSubscription: boolean;
  endpointHost: string;
  subscriptionKey: string; // clé VAPID avec laquelle l'abonnement a réellement été créé
  clientKey: string; // clé VAPID intégrée au site à la compilation
  server: ServerPushStatus | null;
}

export async function getPushDiagnostics(): Promise<PushDiagnostics> {
  const supported = isSupported();
  const diag: PushDiagnostics = {
    supported,
    permission:
      typeof Notification !== "undefined" ? Notification.permission : "indisponible",
    serviceWorkerReady: false,
    hasSubscription: false,
    endpointHost: "",
    subscriptionKey: "",
    clientKey: VAPID_PUBLIC_KEY,
    server: null,
  };
  if (!supported) return diag;

  const reg = await getRegistration(4000);
  diag.serviceWorkerReady = !!reg;
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  if (sub) {
    diag.hasSubscription = true;
    try {
      diag.endpointHost = new URL(sub.endpoint).host;
    } catch {}
    const k = sub.options?.applicationServerKey;
    if (k) diag.subscriptionKey = toBase64Url(k);
  }
  diag.server = await getServerPushStatus();
  return diag;
}

export interface TestPushResult {
  host: string;
  success: boolean;
  status: number | null;
  reason: string;
}

/** Fait envoyer par Laravel une notification de test à tous les appareils du compte. */
export async function sendTestPush(): Promise<{
  results: TestPushResult[];
  message?: string;
} | null> {
  try {
    const res = await apiFetch("/push/test", { method: "POST" });
    if (res?.statut !== 200) return null;
    return { results: res.results ?? [], message: res.message };
  } catch {
    return null;
  }
}