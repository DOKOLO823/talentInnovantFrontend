"use client";

// Emplacement : app/hooks/useFiltreOptions.ts
// Charge les domaines et villes des selects UNE seule fois (mémoire + sessionStorage,
// 10 minutes) : plus d'attente à chaque ouverture de page.

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";

export type DomaineOption = {
  id: number;
  nom: string;
  description?: string | null;
};

type Options = { domaines: DomaineOption[]; lieux: string[] };

const STORAGE_KEY = "ti_filtre_options_v1";
const TTL = 10 * 60 * 1000;

let memory: Options | null = null;
let inflight: Promise<Options | null> | null = null;

const readStorage = (): Options | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { t, data } = JSON.parse(raw);
    return Date.now() - t < TTL ? data : null;
  } catch {
    return null;
  }
};

const writeStorage = (data: Options) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ t: Date.now(), data }));
  } catch {
    /* ignoré */
  }
};

const loadOptions = async (): Promise<Options | null> => {
  if (memory) return memory;

  const stored = readStorage();
  if (stored) {
    memory = stored;
    return stored;
  }

  if (!inflight) {
    inflight = apiFetch("/challenges/filtre/options", { method: "GET" })
      .then((res: any) => {
        if (res && Array.isArray(res.domaines)) {
          memory = { domaines: res.domaines, lieux: res.lieux || [] };
          writeStorage(memory);
          return memory;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
};

export function useFiltreOptions() {
  const [options, setOptions] = useState<Options | null>(memory);
  const [loading, setLoading] = useState(!memory);

  useEffect(() => {
    let cancelled = false;
    if (memory) {
      setOptions(memory);
      setLoading(false);
      return;
    }
    loadOptions().then((o) => {
      if (cancelled) return;
      if (o) setOptions(o);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Nouvel essai (ex : au focus d'un select si le chargement a échoué)
  const reload = useCallback(() => {
    if (memory || inflight) return;
    setLoading(true);
    loadOptions().then((o) => {
      if (o) setOptions(o);
      setLoading(false);
    });
  }, []);

  return { options, loading, reload };
}