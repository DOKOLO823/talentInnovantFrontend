"use client";

// Emplacement conseillé : app/hooks/useChallengeView.ts

import { useEffect, useRef } from "react";
import { apiFetch } from "@/app/lib/api";

// Une seule clé dans le navigateur : un tableau d'ids de challenges déjà vus
const STORAGE_KEY = "ti_viewed_challenges";
const MAX_STORED = 300; // on garde les 300 derniers pour ne pas gonfler le storage

const readViewed = (): number[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.map(Number) : [];
  } catch {
    return []; // navigation privée / storage bloqué
  }
};

const writeViewed = (ids: number[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(-MAX_STORED)));
  } catch {
    /* storage plein ou bloqué : on ignore */
  }
};

export function useChallengeView({
  challengeId,
  enabled,
  onCounted,
}: {
  challengeId?: string | number;
  enabled: boolean; // ex : challenge chargé ET visiteur différent du propriétaire
  onCounted?: (nombrevues: number) => void;
}) {
  const handledRef = useRef<string | null>(null); // évite le double appel (React strict mode)
  const callbackRef = useRef(onCounted);
  callbackRef.current = onCounted;

  useEffect(() => {
    if (!enabled || !challengeId) return;

    const key = String(challengeId);
    if (handledRef.current === key) return;
    handledRef.current = key;

    const id = Number(challengeId);

    // Déjà vu depuis ce navigateur : AUCUNE requête serveur
    if (readViewed().includes(id)) return;

    apiFetch(`/challenge/vue/${id}`, {
      method: "POST",
      body: JSON.stringify({}),
    })
      .then((res: any) => {
        if (res?.statut === 200) {
          // On mémorise seulement après succès (sinon on réessaiera plus tard)
          writeViewed([...readViewed().filter((x) => x !== id), id]);
          if (typeof res.nombrevues === "number") {
            callbackRef.current?.(res.nombrevues);
          }
        } else {
          handledRef.current = null;
          console.error('voici erreur : '+res["message"]);
        } 
      })
      .catch(() => {
        handledRef.current = null;
        
      });
  }, [challengeId, enabled]);
}