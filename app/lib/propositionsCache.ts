// Emplacement : app/lib/propositionsCache.ts
// Garde en mémoire la liste de /reseau/propositions pour que la page
// /collaborateurs s'affiche instantanément (avec mise à jour en arrière-plan).
// Le cache est lié à l'utilisateur connecté : jamais de données d'un autre compte.

import { apiFetch } from "@/app/lib/api";

export type Propositions = {
  talents: any[];
  envoyees: number[];
  recues: number[];
  actives: number[];
};

const MAX_AGE = 5 * 60 * 1000; // affichable tel quel pendant 5 min
const FRESH = 20 * 1000; // pas de nouvel appel réseau avant 20 s

let cache: { userId: string; at: number; data: Propositions } | null = null;
let inflight: Promise<Propositions | null> | null = null;
let inflightUser: string | null = null;

const currentUserId = (): string | null => {
  try {
    const raw = localStorage.getItem("auth");
    const id = raw ? JSON.parse(raw)?.user?.id : null;
    return id != null ? String(id) : null;
  } catch {
    return null;
  }
};

/** Données déjà en mémoire pour l'utilisateur connecté (ou null) */
export function getCachedPropositions(): Propositions | null {
  const uid = currentUserId();
  if (!cache || !uid || cache.userId !== uid) return null;
  if (Date.now() - cache.at > MAX_AGE) return null;
  return cache.data;
}

/** Charge (ou réutilise) la liste. Plusieurs appels simultanés = une seule requête. */
export function loadPropositions(): Promise<Propositions | null> {
  const uid = currentUserId();
  if (!uid) return Promise.resolve(null);

  if (cache && cache.userId === uid && Date.now() - cache.at < FRESH) {
    return Promise.resolve(cache.data);
  }
  if (inflight && inflightUser === uid) return inflight;

  inflightUser = uid;
  inflight = apiFetch("/reseau/propositions", { method: "GET" })
    .then((res: any) => {
      if (res?.statut !== 200) return null;
      const data: Propositions = {
        talents: res.data?.talents || [],
        envoyees: res.data?.ids_demandes_envoyees || [],
        recues: res.data?.ids_demandes_recues || [],
        actives: res.data?.ids_collaborations_actives || [],
      };
      cache = { userId: uid, at: Date.now(), data };
      return data;
    })
    .catch(() => null)
    .finally(() => {
      inflight = null;
      inflightUser = null;
    });

  return inflight;
}

/** À appeler au survol / au toucher d'un bouton : le chargement démarre avant le clic */
export const prefetchPropositions = () => {
  if (!getCachedPropositions()) void loadPropositions();
};

/** Après l'envoi d'une demande : garde le cache cohérent */
export function markRequestSent(talentId: number) {
  if (cache && !cache.data.envoyees.includes(talentId)) {
    cache.data = {
      ...cache.data,
      envoyees: [...cache.data.envoyees, talentId],
    };
  }
}